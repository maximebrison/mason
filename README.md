<h1 align="center">MasonCMS</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/maximebrison/mason/master/.github/icon.svg" alt="icon"  height="200" width="200" margin-right="100%"/>
</p>

> Full documentation will be ready in a few weeks *(as of 2026/04/21)*
>
> You can see it in use by visiting : https://doc.maximebrison.cc

## Idea

A friend of mine needed a website to easily show its projects hosted on [Github](https://github.com) and [Codeberg](https://codeberg.org), and came to me with the idea of a *CMS* that would fetch READMEs from these providers, and fashion them in a modern, clean and easy to manage website.

On the other end, I'm starting as a **Fullstack developer** and needed a *showcase* project. 

> Odoo if you're watching... This one's for you !

## Featured... well, features

- **Easy to setup (less than 5 minutes)**
- Built-in blog *(soon with RSS !)*
    - Auto-compress images
- Built-in admin tools
    - Multi-admin
    - Assets manager (banner, logo, footer)
    - Colors editor
    - Branding (social links, copyright and title)
- Clean responsive UI

## Misc features

- Auto-fetch READMEs and repos info from Github and Codeberg based on API keys
- Auto-fetch the homepage from your main repo *(username/username)*, based on which API key you define as primary in the setup
- Auto-fetch secondary pages from your main repo
- Protected routes
- Anti-spam on login/signup

## Usage

This *CMS* can easily be installed using **Docker Compose** ([Docker Hub page]([hekiito/mason - Docker Image](https://hub.docker.com/r/hekiito/mason)))

You can use **Docker Desktop**, but this quick tutorial will only cover *self-hosting* on a remote linux server with **Docker** and **Docker Compose** already installed.

### compose.yaml

```yaml
services:
  mason:
    image: hekiito/mason:latest
    container_name: mason
    restart: unless-stopped
    environment:
      SECRET_KEY: <your_secret_key> #Required !
      HOST: '0.0.0.0'
      PORT: '8005'
      DEBUG: 'false' # Should stay false in prod
    ports:
      - '8005:8005'
    volumes:
      - ./data/config:/app/config
      - ./data/blog:/app/blog
      - ./data/repos:/app/repos
      - ./data/uploads:/app/uploads
```

**[SECRET_KEY]** Your cookies token for FastAPI. Generate one using the following command :

```bash
openssl rand -hex 32
```

Then copy and paste in your `compose.yaml`

**[DEBUG]** Used to either show or hide the `/redoc` and `/docs` endpoints. Should stay to **false** in production ; even though routes are protected, it's cleaner.

### First install

After creating your `compose.yaml`, run :

```bash
docker compose up -d --build
```

Then access `http://<server-ip>:<port>/` (using the port specified in the `compose.yaml`) and follow the instructions.

#### Getting a Github API key

![2026-04-21_16-59-30-ezgif.com-video-to-gif-converter](https://raw.githubusercontent.com/maximebrison/mason/master/.github/github_api_key.gif)

#### Getting a Codeberg API key

![2026-04-21_17-02-55-ezgif.com-video-to-gif-converter](https://raw.githubusercontent.com/maximebrison/mason/master/.github/codeberg_api_key.gif)

### To know before using !

- Don't use "homepage", "home" or "blog" as secondary pages name in your main repo (username/username)
    - Will be fixed in v1.1.0
- If you forget your admin password, a small utility is provided within the container to generate a new one.
    - `docker exec -it <container-name> python3 reset_password.py`
    - Then change it from the admin panel

## Features to be added

> Last updated : 21/04/2026

Feel free to contribute or suggest ideas !

### UX

| Feature                                                      | Planned                |
| ------------------------------------------------------------ | ---------------------- |
| Ability to add standalone pages and subpages                 | In the next weeks      |
| Ability to reorder the pages in the navbar                   | In the next weeks      |
| RSS Flux button to blog                                      | In the next weeks      |
| Two-factor auth                                              | By the summer 2026     |
| More GIT providers (mainly Gitlab)                           | By the summer 2026     |
| Create my own overlay on Milkdown instead of using Crepe     | By the end of the year |
| Add a *theme* feature, to share and import custom themes     | By the end of the year |
| Add *add-ons* for things such as forms, various integrations... | By the end of the year |
| Add more Fun to the banner (like GOL)                        | -                      |

### Technical

| Feature                                             | Planned            |
| --------------------------------------------------- | ------------------ |
| **Change from URLQueries navigation to path based** | In the next weeks  |
| Move all my *.json* to a SQLite database            | By the summer 2026 |
| Create a demo website                               | -                  |

## Known issues

- "see more" on overflowing blog posts not showing properly on iPad
- Blog post creation/edition on mobile difficult (will be fixed by my new overlay on Milkdown, planned for the end of 2026)
- Loading gif not showing properly on some requests
- Issue when fetching images with relative *src*

## Disclaimer

### General

I tried to do this project in the most accurate way regarding today's good coding practice, but since I used tools I never used before (*SolidJS* for instance) and learned things along the way, there may be some semantical mistakes here and there. Feel free to point them to me !

### AI usage

> I heard it's a thing to precise this now, so here you go.

Computer sciences is all about the tools you use, and how you use them. For me, AI is a good personal tutor for *frameworks*, features or languages I haven't use before. I use it to give me advice on which tool to use, or how a specific *method* works, never to generate plain code.

Therefore I can guarantee that less than 1% of my code is *AI-generated*, that 1% being the few times I forgot to say `Don't give me code`, and it turns out to output me exactly the small bit of code I needed. All proudness apart, I used it.

## Inspirations

> Yes, it's original work, everything written from scrap, but some UI designs ideas came from various websites.

- Navbar items inspired by [W3Schools](https://w3schools.com)
    - My dark theme toggle button looks a lot like theirs too, but it's 100% a coincidence, please trust me on this...
- The admin-panel navbar is inspired by the *settings* page from [Github](https://github.com)
- Dual-navbar layout, while quite basic, was inspired by [Docusaurus](https://docusaurus.io/)

## Credits

> These are libraries and bits of code I used, that are worth mentioning since it does exactly what I want, is easy to use and well documented. Maybe some of them are widely acknowledged, but I didn't know about any of these before, so if it can help you the way it helped me, help yourself !

- Markdown parser : [Milkdown](https://milkdown.dev)
- HTML parser : [BeautifulSoup]([Beautiful Soup Documentation — Beautiful Soup 4.4.0 documentation](https://beautiful-soup-4.readthedocs.io/en/latest/#))
- Game Of Life banner : [CSS-TRICKS](https://css-tricks.com/game-life/)
