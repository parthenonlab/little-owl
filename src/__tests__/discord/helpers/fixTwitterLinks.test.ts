import { fixTwitterLinks } from '@/discord/helpers/fixTwitterLinks';

describe('fixTwitterLinks', () => {
  it('rewrites x.com links', () => {
    expect(fixTwitterLinks('look https://x.com/user/status/123')).toBe(
      'look https://fixvx.com/user/status/123',
    );
  });

  it('rewrites twitter.com links including www and mobile subdomains', () => {
    expect(
      fixTwitterLinks(
        'https://twitter.com/a/status/1 https://www.x.com/b/status/2 https://mobile.twitter.com/c/status/3',
      ),
    ).toBe(
      'https://fixvx.com/a/status/1 https://fixvx.com/b/status/2 https://fixvx.com/c/status/3',
    );
  });

  it('is case-insensitive', () => {
    expect(fixTwitterLinks('HTTPS://X.COM/user/status/1')).toBe(
      'https://fixvx.com/user/status/1',
    );
  });

  it('returns null when there are no twitter links', () => {
    expect(fixTwitterLinks('hello https://box.com/file')).toBeNull();
    expect(fixTwitterLinks('https://fixvx.com/user/status/1')).toBeNull();
  });
});
