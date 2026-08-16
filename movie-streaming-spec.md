# Movie Streaming Web App — Technical Specification

## 1\. Project Overview

Build a Netflix-style web application for streaming pre-recorded movies.

Initial target:

* Up to \~100 concurrent viewers
* Responsive web app for desktop, tablet, and mobile
* User accounts and authentication
* Movie catalogue and categories
* Adaptive bitrate streaming
* Continue watching
* Watch history
* Favourites / My List
* Search
* Admin movie management
* Subtitles
* Basic analytics

This platform is intended for content that the operator owns or is licensed to distribute.

\---

## 2\. Recommended Technology Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **hls.js** for HLS playback
* Native `<video>` playback where HLS is supported directly

### Backend

Use **Next.js Route Handlers / Server Actions** for the MVP.

A separate Node.js API service is not required initially.

Responsibilities:

* Authentication checks
* Movie metadata
* Playback authorization
* Watch progress
* Favourites
* Search
* Admin APIs
* Signed playback URL generation
* Upload / encoding job management

### Database

**Supabase PostgreSQL**

Use Supabase for:

* PostgreSQL database
* Authentication
* Row Level Security
* Realtime features if needed later
* Admin/data management

### Video Storage

**Cloudflare R2**

Store:

* Original uploaded source files
* HLS master playlists
* HLS quality playlists
* Video segments
* Posters
* Backdrops
* Subtitle files

Do **not** serve movie files directly from the application VPS.

### Video Encoding

**FFmpeg**

FFmpeg worker converts source MP4/MKV files into adaptive HLS.

Initial renditions:

|Quality|Resolution|Approx Video Bitrate|
|-|-:|-:|
|1080p|1920×1080|4.5–5 Mbps|
|720p|1280×720|2–2.5 Mbps|
|480p|854×480|0.8–1.2 Mbps|

Audio:

* AAC
* Stereo
* 128–192 kbps

### CDN

Use **Cloudflare CDN** in front of R2.

The application server should never proxy movie segment traffic.

### VPS

A small VPS can host:

* Next.js application
* Nginx
* PM2
* FFmpeg worker
* Redis later if needed

Recommended initial VPS:

* 4 vCPU
* 8 GB RAM
* 80–160 GB SSD
* Ubuntu 24.04 LTS

Encoding is CPU-intensive, so encoding should run as a background worker with limited concurrency.

\---

# 3\. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         │ Next.js + hls.js    │
                         └──────────┬──────────┘
                                    │
                         App/API requests
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Next.js        │
                         │      Web App        │
                         │                     │
                         │ Auth                │
                         │ Movie metadata      │
                         │ Playback auth       │
                         │ Watch progress      │
                         │ Favourites          │
                         └─────────┬───────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │      Supabase       │
                         │ Auth + PostgreSQL   │
                         └─────────────────────┘


Movie delivery:

Browser
   │
   │ HLS .m3u8 / segments
   ▼
Cloudflare CDN
   │
   ▼
Cloudflare R2


Movie ingestion:

Admin Upload
   │
   ▼
R2 / Incoming Storage
   │
   ▼
Encoding Queue
   │
   ▼
FFmpeg Worker
   │
   ├── 1080p
   ├── 720p
   ├── 480p
   ├── thumbnails
   └── master.m3u8
          │
          ▼
     Cloudflare R2
```

\---

# 4\. Application Pages

## Public Pages

### `/`

Home page.

Sections:

* Hero / featured movie
* Trending
* Recently added
* Popular
* Action
* Comedy
* Drama
* Horror
* Sci-Fi
* Continue Watching
* My List

Content should be horizontally scrollable similar to Netflix.

\---

### `/login`

Authentication page.

Support:

* Email/password
* Magic link optional
* Google login optional

\---

### `/register`

New account registration.

\---

### `/movie/\[slug]`

Movie detail page.

Display:

* Backdrop
* Poster
* Movie title
* Release year
* Runtime
* Rating
* Genres
* Synopsis
* Cast
* Director
* Trailer
* Play button
* Add/remove My List
* Similar movies

\---

### `/watch/\[id]`

Full-screen movie player.

Features:

* Play/pause
* Seek
* Volume
* Fullscreen
* Playback speed
* Quality selection
* Subtitle selection
* Current time
* Duration
* Auto resume
* Save progress
* Keyboard shortcuts

Movie playback should start from the user's most recent saved position.

\---

### `/search`

Search:

* Title
* Genre
* Actor
* Director

Initial implementation can use PostgreSQL full-text or indexed `ILIKE`.

\---

### `/my-list`

User favourites.

\---

### `/history`

Recently watched movies.

\---

### `/profile`

User profile and account settings.

\---

# 5\. Admin Interface

Use:

```text
/admin
```

Access restricted to users with:

```text
role = admin
```

Admin functions:

* Add movie
* Edit movie
* Delete/unpublish movie
* Upload source movie
* Upload poster
* Upload backdrop
* Add trailer
* Add genres
* Add cast
* Add subtitles
* Start/retry encoding
* View encoding status
* Publish movie
* Unpublish movie
* View viewing statistics

\---

# 6\. Movie Upload Workflow

Recommended workflow:

```text
1. Admin creates movie
2. Movie record created as DRAFT
3. Admin uploads source file
4. File uploaded to R2
5. Encoding job created
6. FFmpeg worker receives job
7. FFmpeg probes source
8. Generate adaptive HLS
9. Generate poster thumbnails if requested
10. Upload outputs to R2
11. Validate master.m3u8
12. Update movie status to READY
13. Admin publishes movie
14. Movie becomes visible to users
```

Status values:

```text
draft
uploaded
queued
encoding
ready
failed
published
archived
```

\---

# 7\. HLS File Structure

Example:

```text
movies/
└── 01J123ABCXYZ/
    ├── master.m3u8
    │
    ├── 1080p/
    │   ├── index.m3u8
    │   ├── segment00001.ts
    │   ├── segment00002.ts
    │   └── ...
    │
    ├── 720p/
    │   ├── index.m3u8
    │   ├── segment00001.ts
    │   └── ...
    │
    ├── 480p/
    │   ├── index.m3u8
    │   └── ...
    │
    ├── subtitles/
    │   ├── en.vtt
    │   ├── zh.vtt
    │   └── ms.vtt
    │
    └── images/
        ├── poster.webp
        ├── backdrop.webp
        └── thumbnail.webp
```

Prefer deterministic storage paths based on movie UUID rather than movie title.

\---

# 8\. Adaptive Bitrate Streaming

The master playlist should reference all renditions.

Example:

```m3u8
#EXTM3U

#EXT-X-STREAM-INF:BANDWIDTH=5200000,RESOLUTION=1920x1080
1080p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2700000,RESOLUTION=1280x720
720p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480
480p/index.m3u8
```

hls.js automatically adapts quality according to:

* Available bandwidth
* Buffer health
* Device performance
* Screen size

\---

# 9\. Database Design

## `profiles`

```sql
id uuid primary key references auth.users(id)
display\_name text
avatar\_url text
role text default 'user'
created\_at timestamptz default now()
updated\_at timestamptz default now()
```

Roles:

```text
user
admin
```

\---

## `movies`

```sql
id uuid primary key
slug text unique not null
title text not null
original\_title text
description text
release\_year int
runtime\_minutes int
age\_rating text
language text
country text
director text
poster\_url text
backdrop\_url text
trailer\_url text
hls\_master\_path text
status text
featured boolean default false
published\_at timestamptz
created\_at timestamptz default now()
updated\_at timestamptz default now()
```

\---

## `genres`

```sql
id bigint generated always as identity primary key
name text unique not null
slug text unique not null
```

\---

## `movie\_genres`

```sql
movie\_id uuid references movies(id)
genre\_id bigint references genres(id)

primary key(movie\_id, genre\_id)
```

\---

## `people`

Used for actors and directors.

```sql
id uuid primary key
name text not null
photo\_url text
bio text
```

\---

## `movie\_cast`

```sql
movie\_id uuid references movies(id)
person\_id uuid references people(id)
character\_name text
sort\_order int
```

\---

## `subtitles`

```sql
id uuid primary key
movie\_id uuid references movies(id)
language\_code text
label text
storage\_path text
is\_default boolean default false
created\_at timestamptz default now()
```

Example:

```text
en  English
zh  中文
ms  Bahasa Melayu
th  ไทย
```

\---

## `watch\_progress`

```sql
user\_id uuid references auth.users(id)
movie\_id uuid references movies(id)
position\_seconds int default 0
duration\_seconds int
percentage numeric
completed boolean default false
last\_watched\_at timestamptz default now()

primary key(user\_id, movie\_id)
```

\---

## `favorites`

```sql
user\_id uuid references auth.users(id)
movie\_id uuid references movies(id)
created\_at timestamptz default now()

primary key(user\_id, movie\_id)
```

\---

## `view\_sessions`

For analytics.

```sql
id uuid primary key
user\_id uuid
movie\_id uuid
started\_at timestamptz
ended\_at timestamptz
seconds\_watched int
device\_type text
ip\_hash text
user\_agent text
```

Do not store raw IP addresses unless there is a genuine operational reason.

\---

## `encoding\_jobs`

```sql
id uuid primary key
movie\_id uuid references movies(id)
source\_path text
status text
progress numeric default 0
error\_message text
started\_at timestamptz
completed\_at timestamptz
created\_at timestamptz default now()
```

Statuses:

```text
queued
processing
completed
failed
```

\---

# 10\. Row Level Security

Enable Supabase RLS on user-owned tables.

Example policies:

### Watch Progress

Users can:

* Read their own watch progress
* Insert their own watch progress
* Update their own watch progress
* Delete their own watch progress

Condition:

```sql
auth.uid() = user\_id
```

### Favourites

Same rule:

```sql
auth.uid() = user\_id
```

### Movies

Normal users:

* Read published movies only

Admins:

* Full access

Never expose the Supabase service role key to the browser.

\---

# 11\. Authentication

Use Supabase Auth.

MVP:

```text
email + password
```

Later:

```text
Google
Apple
Facebook
Magic Link
```

Session should be available to Next.js server components and API handlers.

\---

# 12\. Video Playback Authorization

Do not expose permanent public movie URLs if access control is required.

Recommended flow:

```text
Browser
   │
   │ GET /api/playback/:movieId
   ▼
Next.js
   │
   ├── verify user
   ├── verify movie permission
   └── generate temporary playback URL
          │
          ▼
Browser receives temporary HLS URL
```

Use short-lived signed URLs or signed cookies.

Example expiration:

```text
2–6 hours
```

Do not generate a signed URL for every `.ts` segment through Next.js.

The CDN/object storage layer should validate access.

\---

# 13\. Video Player

Recommended:

```text
hls.js
```

Create reusable component:

```text
/components/player/MoviePlayer.tsx
```

Responsibilities:

* Initialize HLS
* Load master playlist
* Resume playback
* Track current position
* Send progress updates
* Subtitle selection
* Quality selection
* Handle errors
* Destroy player instance on unmount

\---

# 14\. Watch Progress

Do not update Supabase every second.

Recommended:

Save progress every:

```text
10–20 seconds
```

Also save on:

* Pause
* Seek complete
* Page close
* Player unmount
* Movie completion

Example API:

```text
PUT /api/watch-progress/:movieId
```

Payload:

```json
{
  "positionSeconds": 3842,
  "durationSeconds": 7200
}
```

Mark completed when approximately:

```text
>= 90–95%
```

\---

# 15\. Continue Watching

Query:

```text
watch\_progress
WHERE
user\_id = current\_user
AND completed = false
AND percentage > 1
ORDER BY last\_watched\_at DESC
```

Home card should show a progress bar.

Example:

```text
┌────────────────────┐
│   Movie Artwork    │
└────────────────────┘
███████████────── 67%
```

\---

# 16\. Search

MVP:

Search fields:

```text
movie title
original title
description
genre
cast
director
```

Use PostgreSQL indexes.

Possible later upgrade:

* PostgreSQL full-text search
* Meilisearch
* Typesense

Do not add a separate search service for the first version unless the catalogue becomes large.

\---

# 17\. Recommendations

MVP recommendation algorithm:

```text
same genres
+ similar release period
+ popularity
+ recently added
```

Example:

```text
Because you watched Movie A:

1. Movies sharing genre
2. Exclude current movie
3. Prefer popular movies
4. Return 10–20 results
```

Do not build AI recommendations initially.

Later:

* User preference vectors
* Collaborative filtering
* Embeddings
* Watch-time-based ranking

\---

# 18\. Encoding Worker

Separate process:

```text
apps/web
workers/encoder
```

Run worker using:

```bash
pm2 start encoder.js --name movie-encoder
```

Only encode 1–2 movies concurrently on a small VPS.

Worker flow:

```text
Poll encoding\_jobs
        │
        ▼
lock queued job
        │
        ▼
download/source mount
        │
        ▼
ffprobe
        │
        ▼
ffmpeg transcode
        │
        ▼
upload HLS to R2
        │
        ▼
update database
```

Later replace polling with a proper queue.

\---

# 19\. Queue

For MVP:

Use Supabase `encoding\_jobs`.

Later:

```text
Redis + BullMQ
```

Recommended when:

* Multiple encoding workers
* Retry handling becomes important
* Hundreds of upload jobs
* Priority queues required

\---

# 20\. Suggested Repository Structure

```text
movie-stream/
│
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── login/
│       │   ├── register/
│       │   ├── movie/
│       │   │   └── \[slug]/
│       │   ├── watch/
│       │   │   └── \[id]/
│       │   ├── search/
│       │   ├── my-list/
│       │   ├── history/
│       │   ├── profile/
│       │   ├── admin/
│       │   │   ├── movies/
│       │   │   ├── uploads/
│       │   │   └── encoding/
│       │   └── api/
│       │       ├── movies/
│       │       ├── playback/
│       │       ├── progress/
│       │       ├── favorites/
│       │       └── admin/
│       │
│       ├── components/
│       │   ├── movie/
│       │   ├── player/
│       │   ├── layout/
│       │   └── ui/
│       │
│       ├── lib/
│       │   ├── supabase/
│       │   ├── r2/
│       │   ├── auth/
│       │   └── playback/
│       │
│       └── middleware.ts
│
├── workers/
│   └── encoder/
│       ├── src/
│       │   ├── worker.ts
│       │   ├── ffmpeg.ts
│       │   ├── probe.ts
│       │   └── r2.ts
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── scripts/
│   ├── create-admin.ts
│   └── import-movies.ts
│
├── .env.example
├── package.json
└── README.md
```

\---

# 21\. Environment Variables

Example:

```env
NEXT\_PUBLIC\_SUPABASE\_URL=
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=

SUPABASE\_SERVICE\_ROLE\_KEY=

R2\_ACCOUNT\_ID=
R2\_ACCESS\_KEY\_ID=
R2\_SECRET\_ACCESS\_KEY=
R2\_BUCKET=
R2\_PUBLIC\_HOST=

PLAYBACK\_SIGNING\_SECRET=

APP\_URL=https://example.com
```

Important:

```text
SUPABASE\_SERVICE\_ROLE\_KEY
R2\_SECRET\_ACCESS\_KEY
PLAYBACK\_SIGNING\_SECRET
```

must only exist server-side.

\---

# 22\. Movie Metadata Example

```json
{
  "id": "d26cb44c-d247-4d1d-aedd-c10b12c28ee7",
  "slug": "example-movie",
  "title": "Example Movie",
  "description": "Movie description...",
  "releaseYear": 2026,
  "runtimeMinutes": 118,
  "genres": \[
    "Action",
    "Thriller"
  ],
  "posterUrl": "/images/poster.webp",
  "backdropUrl": "/images/backdrop.webp",
  "status": "published"
}
```

\---

# 23\. Performance Target

Initial target:

```text
100 concurrent viewers
```

Important principle:

The 100 viewers should connect primarily to:

```text
Cloudflare CDN → R2
```

and **not**:

```text
100 viewers → VPS → movie files
```

The VPS mostly handles lightweight requests such as:

```text
login
metadata
progress
search
authorization
favourites
admin
```

This greatly reduces server bandwidth and load.

\---

# 24\. Approximate Streaming Traffic

Assuming average adaptive bitrate:

```text
3 Mbps
```

100 simultaneous viewers represent approximately:

```text
300 Mbps
```

of video delivery.

That traffic should be handled by the CDN/object-storage layer.

Approximate data per 2-hour movie at 3 Mbps:

```text
\~2.7 GB per viewer
```

For 100 full views:

```text
\~270 GB
```

This is separate from application API traffic.

\---

# 25\. Caching

Static assets:

```text
Cache-Control: public, max-age=31536000, immutable
```

Movie HLS segments can be heavily cached because they are immutable after encoding.

Recommended strategy:

```text
master.m3u8       shorter cache
quality playlists moderate cache
video segments    long cache
poster/backdrop   long cache
```

Never overwrite encoded segment files in place.

When re-encoding, use a new version/path.

Example:

```text
movies/{movieId}/v1/
movies/{movieId}/v2/
```

\---

# 26\. Security

Minimum requirements:

* HTTPS everywhere
* Supabase RLS
* Admin role checks on server
* Private R2 bucket for protected content
* Signed playback authorization
* Rate-limit login and sensitive APIs
* Validate all upload types
* Validate movie IDs
* Sanitize user input
* Keep secrets server-side
* Do not expose source video paths
* Log admin actions
* Disable directory listing
* Use secure cookies
* Add CSRF protection where relevant

\---

# 27\. Anti-Sharing / Content Protection

Signed URLs prevent simple permanent-link sharing but are **not DRM**.

MVP protection:

```text
authentication
+ signed URLs
+ short expiry
+ optional concurrent-stream limit
```

Later for commercial premium content:

```text
Widevine
FairPlay
PlayReady
```

DRM should only be introduced if licensing requirements justify the cost and complexity.

\---

# 28\. Concurrent Session Control

Optional table:

## `active\_streams`

```sql
id uuid primary key
user\_id uuid
movie\_id uuid
session\_id text
last\_seen\_at timestamptz
created\_at timestamptz
```

Example policy:

```text
Basic account:
maximum 1–2 simultaneous movie streams
```

Player sends heartbeat:

```text
every 30–60 seconds
```

Expired sessions can be removed automatically.

\---

# 29\. Subscription / Payment — Future

Do not include payment in the first technical MVP unless necessary.

Future:

```text
plans
subscriptions
payments
entitlements
```

Possible plans:

```text
Free
Basic
Premium
```

Playback authorization becomes:

```text
Is authenticated?
      ↓
Does subscription allow this movie?
      ↓
Is simultaneous-stream limit available?
      ↓
Generate playback authorization
```

\---

# 30\. Analytics

MVP metrics:

* Movie starts
* Unique viewers
* Total watch time
* Completion rate
* Most watched movies
* Average watch duration
* Number of active users
* Playback failures

Do not log a database row every playback second.

Aggregate events intelligently.

\---

# 31\. Logging

Recommended:

```text
PM2 logs
Next.js application logs
Encoder logs
Database job status
```

Later:

* Sentry
* Grafana
* Loki
* Uptime monitoring
* ntfy alerts

Useful alerts:

```text
website down
encoding failed
R2 upload failed
database unavailable
disk > 85%
CPU overload
```

\---

# 32\. Backups

Supabase:

* Enable database backups appropriate to the chosen plan
* Export critical metadata periodically

R2:

* Original movie master should be retained separately
* Consider object versioning for important files

Do not consider generated HLS the only master copy.

Keep:

```text
original/source
+
encoded/distribution copy
```

\---

# 33\. MVP Development Phases

## Phase 1 — Core

Build:

* Next.js project
* Supabase
* Authentication
* Movie database
* Home page
* Movie details
* Basic admin
* R2 integration

\---

## Phase 2 — Streaming

Build:

* FFmpeg encoder
* HLS adaptive renditions
* R2 upload
* hls.js player
* Playback authorization
* Subtitle support

\---

## Phase 3 — User Features

Build:

* Continue watching
* My List
* Watch history
* Search
* Profiles

\---

## Phase 4 — Admin \& Operations

Build:

* Upload workflow
* Encoding jobs
* Retry failed jobs
* Publish/unpublish
* Analytics
* Monitoring
* ntfy alerts

\---

## Phase 5 — Scale

Only when required:

* Redis
* BullMQ
* Multiple FFmpeg workers
* Dedicated encoding machine/GPU encoding
* Improved CDN rules
* DRM
* Subscription system
* Recommendation engine
* Smart TV/mobile apps

\---

# 34\. Features Not Needed for MVP

Avoid initially:

* WebRTC
* MediaMTX
* Live streaming
* Kubernetes
* Microservices
* Kafka
* Elasticsearch
* AI recommendations
* Custom video protocol
* Custom CDN
* Custom transcoder
* DRM unless required
* Native Android/iOS apps

Keep the architecture simple.

\---

# 35\. MVP Success Criteria

The MVP is successful when:

* Admin can upload a movie
* System encodes it into HLS
* Movie is stored in R2
* Admin can publish it
* User can register/login
* User can browse catalogue
* User can play a movie
* Playback automatically adjusts quality
* Subtitles work
* User can leave and resume later
* User can add/remove favourites
* Search works
* 100 concurrent viewers can stream without routing movie traffic through the VPS

\---

# 36\. Recommended Final Architecture

```text
                     USERS
                       │
               ┌───────▼────────┐
               │ Cloudflare CDN │
               └───────┬────────┘
                       │
          ┌────────────┴─────────────┐
          │                          │
          ▼                          ▼
      Next.js                  Cloudflare R2
      Website                  HLS / Images
          │
          │
          ▼
      Supabase
  Auth + PostgreSQL


ADMIN
  │
  ▼
Next.js Admin
  │
  ▼
R2 Original Upload
  │
  ▼
Encoding Job
  │
  ▼
FFmpeg Worker
  │
  ▼
Adaptive HLS
  │
  ▼
Cloudflare R2
```

\---

# 37\. Core Design Principle

The application is responsible for:

```text
WHO can watch
WHAT they can watch
WHERE they stopped
WHAT movies exist
```

Cloudflare is responsible for:

```text
DELIVERING the video bytes
```

FFmpeg is responsible for:

```text
PREPARING the video for streaming
```

Supabase is responsible for:

```text
USERS + DATA
```

Next.js is responsible for:

```text
WEB UI + APPLICATION LOGIC
```

This separation keeps the system inexpensive, maintainable, and suitable for an initial Netflix-style service with around 100 concurrent viewers.

