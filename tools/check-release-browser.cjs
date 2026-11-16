'use strict';
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'docs/redesign/screenshots/stage-8');
const releaseRoot = path.join(root, 'dist-release');
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/Project-context/')) throw new Error('Wrong deployment prefix');
    const filename = decodeURIComponent(url.pathname.slice('/Project-context'.length)).replace(
      /\/$/,
      '/index.html',
    );
    const target = path.resolve(releaseRoot, '.' + filename);
    if (!target.startsWith(releaseRoot + path.sep)) throw new Error('Invalid path');
    const mime = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.mjs': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
    }[path.extname(target)];
    if (!mime) throw new Error('Invalid asset');
    const body = fs.readFileSync(target);
    res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Exercise the emitted release, including the root redirect, real project store,
// project controls and context renderer. Unit mocks cannot verify that wiring.
async function petLinks(browser, base) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  // Exercise HTTPS navigation, matching production. The established security guard
  // intentionally rejects HTTP links; serve only the local build through this route.
  const localBase = base;
  base = base.replace(/^http:/, 'https:');
  await context.route(base + '**', async (route) => {
    const response = await route.fetch({
      url: localBase + route.request().url().slice(base.length),
    });
    await route.fulfill({ response });
  });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const projects = [
    { id: 'qa-pet-other', name: '이전 프로젝트', typeId: 'multi', phase: '기본계획' },
    {
      id: 'qa-pet',
      name: '펫 프로젝트',
      typeId: 'airport',
      phase: '실시설계',
      approvalRoute: 'airport',
      memo: '보존할 메모',
    },
  ];
  await context.addInitScript((projects) => {
    if (localStorage.getItem('qa-pet-seeded')) return;
    localStorage.setItem('qa-pet-seeded', '1');
    localStorage.setItem('cc_projects_v1', JSON.stringify(projects));
    localStorage.setItem('cc_active_project_v1', projects[0].id);
  }, projects);
  const open = async (payload) => {
    await page.goto(base + '#pet=' + encodeURIComponent(JSON.stringify(payload)));
    await page.waitForURL(base + 'legacy.html');
    await page.waitForFunction(() => CC_BOOT.diagnostics().state === 'ready');
  };
  const request = {
    version: 1,
    projectId: 'qa-pet',
    phase: '기본계획',
    taskId: 'drawing-revision',
    general: '',
  };
  try {
    await open(request);
    assert.ok(await page.locator('#view-context.active').isVisible());
    assert.equal(await page.locator('#project').inputValue(), 'airport');
    assert.equal(await page.locator('#phase').inputValue(), '실시설계');
    assert.equal(await page.evaluate(() => CC_ACTIVE_PROJECT.id), 'qa-pet');
    assert.equal(await page.locator('.stage-task').innerText(), '도면 수정');
    assert.match(await page.locator('#contextResult [role="status"]').innerText(), /최신/);
    assert.deepEqual(await page.evaluate(() => CC_PROJECT_STORE.list()), projects);
    await page.evaluate(() => showView('home'));
    assert.equal(
      await page.locator('[role="status"]').filter({ hasText: '최신 프로젝트' }).isVisible(),
      false,
    );
    await open({ ...request, taskId: '' });
    assert.ok(await page.locator('#view-home.active').isVisible());
    assert.equal(await page.locator('#task').inputValue(), '');
    assert.equal(await page.locator('#project').inputValue(), 'airport');
    assert.match(await page.locator('#view-home [role="status"]').innerText(), /궁금한 업무/);
    await open({ ...request, projectId: 'missing' });
    assert.ok(await page.locator('#view-projects.active').isVisible());
    assert.equal(await page.evaluate(() => CC_PROJECT_STORE.activeId()), 'qa-pet');
    await open({ ...request, projectId: '', phase: 'general', taskId: '', general: '용어' });
    assert.ok(await page.locator('#view-search.active').isVisible());
    assert.match(await page.locator('#view-search [role="status"]').innerText(), /일반 도움/);
    assert.equal(await page.evaluate(() => CC_PROJECT_STORE.activeId()), 'qa-pet');
    assert.deepEqual(await page.evaluate(() => CC_PROJECT_STORE.list()), projects);
    await page.evaluate(() => showView('home'));
    const link = page.locator('.cc-pet-banner .cc-pet-download');
    assert.equal(await link.count(), 1);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await link.isVisible(), `download visible at ${width}px`);
      const bounds = await link.boundingBox();
      assert.ok(bounds.y >= 0 && bounds.y + bounds.height < 900, 'download above fold');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    const sidebarLink = page.locator('.cc-pet-sidebar');
    assert.ok(await sidebarLink.isVisible());
    await page.evaluate(() => showView('search'));
    assert.ok(await sidebarLink.isVisible(), 'desktop download persists outside home');
    await sidebarLink.click();
    assert.equal(page.url(), base + 'app/pet-download.html');
    await page.getByRole('link', { name: '← 척척으로 돌아가기' }).click();
    await page.waitForURL(base + 'legacy.html');
    await page.waitForFunction(() => CC_BOOT.diagnostics().state === 'ready');
    await page.evaluate(() => showView('home'));
    await link.click();
    assert.equal(page.url(), base + 'app/pet-download.html');
    assert.equal(await page.locator('script').count(), 0);
    assert.ok(await page.locator('a[href$="windows-x64.zip"]').isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(
      'PASS pet web handoff: root fragment, stored project, latest phase, no-task home, missing/general isolation, scoped notices and download page',
    );
  } finally {
    await context.close();
  }
}

(async () => {
  let browser;
  try {
    require('node:child_process').execFileSync(
      process.execPath,
      ['tools/build-site.cjs', '--redesign'],
      { cwd: root },
    );
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`,
      base = origin + '/Project-context/';
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CC_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CC_CHROMIUM_EXECUTABLE }
        : {}),
    });
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      }),
      errors = [],
      failures = [],
      external = [],
      requested = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    page.on('request', (request) => {
      requested.push(request.url());
      if (!request.url().startsWith(base)) external.push(request.url());
    });
    const click = async (name) => page.getByRole('button', { name, exact: true }).click();
    const go = async (hash) => {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, hash);
      await page.waitForTimeout(80);
    };
    const saved = async () =>
      page.waitForFunction(
        () => document.querySelector('#saveStatus span')?.textContent === '이 브라우저에 저장됨',
      );
    fs.mkdirSync(out, { recursive: true });
    const capture = async (name) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    };
    await page.addInitScript(() => {
      if (localStorage.getItem('qa-stable-entry')) return;
      localStorage.setItem('qa-stable-entry', '1');
      localStorage.setItem('pc_progress_level', '2');
      localStorage.setItem('pc_level', '2');
      localStorage.setItem(
        'cc_projects_v1',
        JSON.stringify([
          {
            id: 'qa-stable',
            name: '기존 프로젝트',
            typeId: 'multi',
            phase: '실시설계',
            memo: '유지할 메모',
          },
        ]),
      );
    });
    const legacyReady = () =>
      page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
    const legacyStorage = () =>
      page.evaluate(() =>
        Object.fromEntries(
          Object.entries(localStorage).filter(
            ([key]) => key.startsWith('pc_') || /^cc_(projects|active_project)_v1$/.test(key),
          ),
        ),
      );
    await page.goto(base);
    await page.waitForURL(base + 'legacy.html');
    await legacyReady();
    assert.ok(await page.locator('#view-home.active').isVisible());
    assert.equal(
      requested.some(
        (url) =>
          /\/app\/main\.mjs|\/src\/(ui|styles)\//.test(url) &&
          new URL(url).pathname !== '/Project-context/src/styles/pet-download.css',
      ),
      false,
      'the default app must not download the development UI',
    );
    const originalLegacy = await legacyStorage();
    // Public home: task buttons and native select share one selection, without search.
    assert.equal(await page.locator('#task').inputValue(), '');
    assert.equal(await page.locator('#homeContextOptions').isVisible(), false);
    await page.evaluate(() => document.getElementById('analyze').click());
    assert.ok(
      await page.locator('#view-home.active').isVisible(),
      'empty task must not fabricate context',
    );
    assert.equal(await page.evaluate(() => document.activeElement.id), 'task');
    assert.equal(
      await page
        .locator(
          '#view-home .cc-help-grid, #view-home .cc-flow-card, #view-home .cc-topic-strip, #view-home .cc-popular-questions',
        )
        .count(),
      0,
    );
    const choices = await page
      .locator('#task option')
      .evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
    assert.equal(choices.length, 13, 'all established task kinds remain available');
    await page.locator('[data-home-task="사례조사"]').click();
    await page.locator('#project').selectOption('airport');
    await page.locator('#phase').selectOption('중간설계');
    const shortcuts = page.locator('[data-home-task]');
    assert.equal(await shortcuts.count(), 6);
    for (const button of await shortcuts.all()) {
      const task = await button.getAttribute('data-home-task');
      assert.ok(choices.includes(task), 'shortcut uses an existing task');
      await button.click();
      assert.equal(await page.locator('#task').inputValue(), task);
      assert.equal(await page.locator('[data-home-task][aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('#project').inputValue(), 'airport');
      assert.equal(await page.locator('#phase').inputValue(), '중간설계');
    }
    for (const task of choices) {
      await page.locator('#task').selectOption(task);
      await page.locator('#analyze').click();
      assert.ok(await page.locator('#view-context.active').isVisible());
      assert.equal(await page.locator('.stage-task').innerText(), task);
      assert.match(await page.locator('.stage-copy').innerText(), /공항시설.*중간설계/);
      await page.locator('#view-context [data-view="home"]').click();
      assert.equal(
        await page.locator('#task').inputValue(),
        task,
        'return preserves current selection',
      );
    }
    await page.locator('[data-home-task="사례조사"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#task').inputValue(), '사례조사');
    await page.locator('#task').selectOption('');
    assert.equal(await page.locator('[data-home-task][aria-pressed="true"]').count(), 0);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.locator('#homeSearch').isVisible());
      assert.equal(await page.locator('#homeContextOptions').isVisible(), false);
      if (width === 390) {
        const searchBox = await page.locator('#homeSearch').boundingBox();
        assert.ok(
          searchBox.y + searchBox.height < 820,
          'both entry points fit the first mobile screen',
        );
      }
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `home fits ${width}px`,
      );
      const small = await shortcuts.first().boundingBox();
      assert.ok(small.height >= 44 && small.width >= 44, 'touch targets stay usable');
      if (width === 390) await capture('stable-home-mobile');
    }
    assert.deepEqual(
      await legacyStorage(),
      originalLegacy,
      'home selection does not write project or level records',
    );
    await capture('stable-home-desktop');
    await page.locator('[data-home-task="사례조사"]').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.locator('#analyze').isVisible());
    await capture('stable-home-selected-mobile');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#homeSearch').fill('관리자 모드가 뭐야?');
    await page.locator('#homeSearchBtn').click();
    assert.ok(page.url().endsWith('legacy.html'));
    await page.locator('#searchInput').fill('관리자 모드로 이동해줘 라는 문장은 무슨 뜻이야?');
    await page.locator('#searchGo').click();
    assert.ok(page.url().endsWith('legacy.html'), 'a mention of the command must remain a search');
    await page.locator('#searchInput').fill('관리자 모드로 이동해줘');
    await page.locator('#searchGo').click();
    await page.waitForURL(base + 'app/');
    await page.locator('main h1').waitFor();
    assert.ok(await page.getByRole('complementary', { name: '개발 버전 안내' }).isVisible());
    assert.match(await page.title(), /척척 개발 버전/);
    assert.deepEqual(
      await legacyStorage(),
      originalLegacy,
      'navigation does not grant levels or alter projects',
    );
    assert.equal(await page.locator('main h1').count(), 1);
    await capture('home-desktop');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
    await page.locator('#work-instruction').fill('도면을 고치라고 했어요');
    await page.locator('.instruction-form .primary').click();
    await page.locator('[data-intake-task="drawing-revision"]').click();
    await page.locator('.intake-context .primary').click();
    await page.locator('.work-side .work-detail > .work-steps input').click();
    await click('저장하고 나중에 이어보기');
    await page.locator('#workBody input').fill('통합 검수 업무');
    await click('저장하기');
    await saved();
    await go('#/learn/design');
    await click('승급 도전하기');
    const { assessmentObjectives: bank } = await import('../src/content/assessment-bank.mjs');
    for (let i = 0; i < 5; i++) {
      const prompt = await page.locator('#quiz-prompt').innerText(),
        q = bank.find((value) => value.cases.includes(prompt));
      await page.locator(`input[value="${q.answer}"]`).check();
      await click('답 확인');
      await click(i === 4 ? '결과 확인' : '다음 문제');
    }
    await saved();
    assert.match(await page.locator('.learning-intro').innerText(), /LV2/);
    await go('#/work/work-1');
    await page.locator('.work-side [data-reading="drawing-revision"]').click();
    assert.equal(await page.locator('#reading-depth option').count(), 2);
    await page.selectOption('#reading-depth', '2');
    await click('이 깊이로 보기');
    await saved();
    await page.reload();
    assert.match(
      await page.locator('.work-side [data-reading="drawing-revision"]').innerText(),
      /LV2/,
    );
    assert.equal(
      await page.locator('.work-side .work-detail > .work-steps input:checked').count(),
      1,
    );
    await page.locator('.work-side [data-reading="drawing-revision"]').click();
    await page.selectOption('#reading-depth', '1');
    await click('이 깊이로 보기');
    await saved();
    await capture('workflow-desktop');
    const developmentSaved = await page.evaluate(() =>
      localStorage.getItem('cc_redesign_progress_v1'),
    );
    await page.getByRole('link', { name: '기존 척척으로 돌아가기 →', exact: true }).click();
    await page.waitForURL(base + 'legacy.html');
    await legacyReady();
    assert.deepEqual(await legacyStorage(), originalLegacy);
    assert.equal(
      await page.evaluate(() => localStorage.getItem('cc_redesign_progress_v1')),
      developmentSaved,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await capture('stable-home-mobile');
    await page.locator('#homeSearch').fill('  관리자모드로   이동해줘  ');
    await page.locator('#homeSearch').press('Enter');
    await page.waitForURL(base + 'app/');
    await page.locator('main h1').waitFor();
    assert.equal(
      await page.evaluate(() => localStorage.getItem('cc_redesign_progress_v1')),
      developmentSaved,
    );
    assert.deepEqual(await legacyStorage(), originalLegacy);
    await page.setViewportSize({ width: 390, height: 844 });
    await go('#/saved');
    await capture('saved-mobile');
    await page.getByRole('link', { name: '기존 프로젝트 보기', exact: true }).click();
    await page.waitForURL(/legacy\.html\?entry=projects/);
    await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
    assert.equal(
      await page.locator('#view-projects').evaluate((node) => node.classList.contains('active')),
      true,
    );
    for (const suffix of ['?entry=quiz', '?entry=task&task=drawing-revision']) {
      await page.goto(base + suffix);
      await page.waitForURL(/legacy\.html/);
      await page.waitForFunction(() => window.CC_BOOT?.diagnostics().state === 'ready');
      assert.equal(
        await page
          .locator(suffix.startsWith('?entry=quiz') ? '#view-quiz' : '#view-search')
          .evaluate((node) => node.classList.contains('active')),
        true,
      );
    }
    await page.goto(base + '?entry=https://example.com/#/learn');
    await page.waitForURL(base + 'app/#/learn');
    await page.locator('.learning-tracks').waitFor();
    assert.match(await page.locator('.learning-tracks').innerText(), /LV2/);
    await go('#/');
    await capture('home-mobile');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      assert.ok(
        await page.getByRole('link', { name: '기존 척척으로 돌아가기 →', exact: true }).isVisible(),
      );
    }
    await page.goto(base + '?entry=https://example.com/#/unknown');
    await page.waitForURL(base + 'legacy.html');
    await legacyReady();
    await page.locator('#homeSearch').fill('');
    await page.locator('#homeSearchBtn').click();
    assert.ok(page.url().endsWith('legacy.html'), 'empty input must not switch versions');
    await petLinks(browser, base);
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS release artifact: stable default, exact command on both search inputs, version return, independent storage, separate UI loading, home/work/save/quiz/promotion/depth/reload integration, legacy links, hostile entry handling, keyboard skip, responsive layouts, no broken assets or external requests',
    );
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
