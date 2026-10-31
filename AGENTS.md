<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep lesson identities and tutor input validation in a shared client-safe lesson context module; resolve teaching context on the server so hints match the actual lesson.
- Keep tutor generation in the authenticated streaming server handler and use the existing AI Gateway model; never expose model credentials to the browser.
