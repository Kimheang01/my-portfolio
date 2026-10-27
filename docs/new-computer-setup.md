# Setting up on a new computer

Everything the site needs is in this repository except one file,
`.env.local`, which holds the secrets and is never committed. On a new
computer you clone the repository and recreate that file. The live site
(Vercel, Neon, Vercel Blob) doesn't change.

## 1. Install the tools

- **Node.js 22** (LTS): from [nodejs.org](https://nodejs.org), or `nvm install 22`.
- **Yarn 1**: `npm install -g yarn`.
- **Git**: on a Mac, `xcode-select --install`.
- **Google Chrome**: only needed for `yarn test:e2e`.

## 2. Get the code

```bash
cd ~/Desktop
git clone https://github.com/Kimheang01/my-portfolio.git
cd my-portfolio
yarn
cp .env.example .env.local
```

## 3. Fill in `.env.local`

Open it (`open -e .env.local`) and fill in these seven values. Each line is
`NAME=value`, with no spaces around `=` and no quotes.

| Setting | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon → project **my-portfolio** → branch **dev** → **Connect** → Connection string (pooling on). Use the **dev** branch, never **production**: anything you try locally then stays off the live site. |
| `BETTER_AUTH_URL` | `http://localhost:3000` (already filled in). |
| `BETTER_AUTH_SECRET` | A new random value: `openssl rand -base64 32 \| tr -d '\n' \| pbcopy`, then paste. |
| `ADMIN_GITHUB_ID` | `172888373`, the GitHub account allowed into `/admin`. |
| `GITHUB_CLIENT_ID` | GitHub → Settings → Developer settings → OAuth Apps → **Portfolio admin (local)** → Client ID. |
| `GITHUB_CLIENT_SECRET` | The same app → **Generate a new client secret**. An old secret can't be shown again, but it keeps working where it's already used. |
| `BLOB_READ_WRITE_TOKEN` | Vercel → project **heang-portfolio** → Settings → Environment Variables → `BLOB_READ_WRITE_TOKEN` → 👁 → copy. It starts with `vercel_blob_rw_`. |

To put a secret in the file without it showing on screen or in your shell
history, copy it, then run (replace `NAME`):

```bash
echo "NAME=$(pbpaste)" >> .env.local && echo -n "" | pbcopy
```

Check that every setting is there exactly once (this shows names only):

```bash
grep -o "^[A-Z_]*=" .env.local
```

## 4. Run it

```bash
yarn dev
```

Open <http://localhost:3000>, and sign in at <http://localhost:3000/admin>.
There's no need to run `yarn db:migrate` or `yarn db:seed`: the Neon `dev`
branch already has the tables and the content.

## Tips

- Keep the seven values in a password manager (Apple Passwords, 1Password,
  Bitwarden); the next setup is then a copy-paste.
- To refresh the `dev` database with the live content, open the `dev` branch
  in Neon and use **Reset from parent**.
- Both computers and the live site share one image store. Don't delete
  images in the local `/admin/media` that the live site uses.
