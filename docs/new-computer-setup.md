# Setting up on a new computer

Everything the site needs is in this repository except one file,
`.env.local`, which holds the secrets and is never committed. On a new
computer you clone the repository and recreate that file. The live site
(Vercel, Neon, Vercel Blob) doesn't change.

The steps are the same on Windows and on a Mac; where a command differs,
both are given.

## 1. Install the tools

- **Node.js 22**: from [nodejs.org](https://nodejs.org). On Windows, pick the
  22.x installer; `winget install OpenJS.NodeJS.LTS` now installs Node 24,
  which this project hasn't been tried on. With a version manager:
  `nvm install 22` (Mac) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
- **Yarn 1**: `npm install -g yarn`.
- **Git**: Windows — [git-scm.com](https://git-scm.com) or
  `winget install Git.Git`; Mac — `xcode-select --install`.
- **Google Chrome**: only needed for `yarn test:e2e`.

Check they're all there:

```bash
node -v && yarn -v && git --version
```

### Which terminal to use on Windows

Git's installer includes **Git Bash**, where every `bash` command in this
repository works as written, including `yarn frames:video` and
`yarn test:e2e`. PowerShell runs the `yarn` scripts fine but not the shell
scripts. The commands below are marked when they differ.

## 2. Get the code

```bash
git clone https://github.com/Kimheang01/my-portfolio.git
cd my-portfolio
yarn
cp .env.example .env.local
```

Clone it wherever you keep projects — `~/Desktop` on a Mac, `D:\` or
`%USERPROFILE%\Projects` on Windows. Avoid OneDrive-synced folders:
syncing `node_modules` is slow and can lock files mid-build.

## 3. Fill in `.env.local`

Open it and fill in these seven values. Each line is `NAME=value`, with no
spaces around `=` and no quotes.

- **Windows:** `notepad .env.local`
- **Mac:** `open -e .env.local`

Add to the file rather than replacing it — all seven names are already there,
waiting for their values.

| Setting | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon → project **my-portfolio** → branch **dev** → **Connect** → Connection string (pooling on). Use the **dev** branch, never **production**: anything you try locally then stays off the live site. |
| `BETTER_AUTH_URL` | `http://localhost:3000` (already filled in). |
| `BETTER_AUTH_SECRET` | A new random value — see below. Use a different one on each computer and in production. |
| `ADMIN_GITHUB_ID` | The numeric id of the one GitHub account allowed into `/admin`, from `https://api.github.com/users/<username>` (the `"id"` field). |
| `GITHUB_CLIENT_ID` | GitHub → Settings → Developer settings → OAuth Apps → **Portfolio admin (local)** → Client ID. |
| `GITHUB_CLIENT_SECRET` | The same app → **Generate a new client secret**. An old secret can't be shown again, but it keeps working where it's already used. |
| `BLOB_READ_WRITE_TOKEN` | Vercel → project **heang-portfolio** → Settings → Environment Variables → `BLOB_READ_WRITE_TOKEN` → 👁 → copy. It starts with `vercel_blob_rw_`. |

### Generating `BETTER_AUTH_SECRET`

This works in every shell on both systems, and needs no OpenSSL (Git for
Windows doesn't put `openssl` on the PATH):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

On a Mac, `openssl rand -base64 32` does the same.

### Pasting a secret without it appearing on screen

Copy the value, then append it from the clipboard (replace `NAME`):

```powershell
# Windows, PowerShell
Add-Content .env.local "NAME=$(Get-Clipboard)"; Set-Clipboard -Value ""
```

```bash
# Mac
echo "NAME=$(pbpaste)" >> .env.local && echo -n "" | pbcopy
```

### Checking the file

Both of these print the setting names only, never the values:

```bash
# Git Bash or Mac
grep -o "^[A-Z_]*=" .env.local
```

```powershell
# Windows, PowerShell
Select-String -Path .env.local -Pattern '^[A-Z_]+=' | ForEach-Object { ($_.Line -split '=')[0] }
```

All seven names should be listed exactly once.

## 4. Run it

```bash
yarn dev
```

Open <http://localhost:3000>, and sign in at <http://localhost:3000/admin>.
There's no need to run `yarn db:migrate` or `yarn db:seed`: the Neon `dev`
branch already has the tables and the content.

**It has to be port 3000.** If another program holds it, Next.js quietly
starts on 3001 and the public site still works — but signing in fails,
because the GitHub OAuth app only allows a callback on
`http://localhost:3000/api/auth/callback/github`. Free the port instead of
accepting 3001:

```powershell
# Windows: find what's on 3000, then stop it
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
taskkill /PID <pid> /F
```

```bash
# Mac
lsof -ti tcp:3000 | xargs kill
```

## If `/admin` won't let you in

A missing admin setting fails **late**: the login page still renders with its
"Sign in with GitHub" button, and the error only appears when you click it.
So a login page that loads doesn't mean the admin is set up.

- **The click returns a 500** → one of `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_URL` or `BETTER_AUTH_SECRET` is empty.
  The terminal names which one.
- **GitHub shows a redirect-URI mismatch** → the OAuth app's callback URL
  isn't exactly `http://localhost:3000/api/auth/callback/github`, or the site
  is running on another port.
- **"This GitHub account can't sign in here"** → `ADMIN_GITHUB_ID` isn't the
  id of the account you signed in with. Only that one account gets in.

## Tips

- Keep the seven values in a password manager (Apple Passwords, 1Password,
  Bitwarden); the next setup is then a copy-paste.
- `.env.local` is only read when the server starts, so **restart `yarn dev`
  after editing it** — saving the file isn't enough.
- **A change to `db/schema/` also needs a full restart**, not just a hot
  reload: in development the database connection is cached on `globalThis`
  (see `db/index.ts`) and it carries the old schema with it. The symptom is
  every page failing with a query that mentions a column you just changed.
- To refresh the `dev` database with the live content, open the `dev` branch
  in Neon and use **Reset from parent**.
- Both computers and the live site share one image store. Don't delete
  images in the local `/admin/media` that the live site uses.
