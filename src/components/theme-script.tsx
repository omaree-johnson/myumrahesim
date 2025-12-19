export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const THEME_STORAGE_KEY = 'umrahesim-theme';
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            const theme = stored === 'light' || stored === 'dark' ? stored : 'system';
            
            let resolved;
            if (theme === 'system') {
              resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
              resolved = theme;
            }
            
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(resolved);
          })();
        `,
      }}
    />
  );
}






