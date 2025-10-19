-- CreateTable
CREATE TABLE "public"."playlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "streamDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."playlist_tracks" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlists_userId_idx" ON "public"."playlists"("userId");

-- CreateIndex
CREATE INDEX "playlists_streamDate_idx" ON "public"."playlists"("streamDate");

-- CreateIndex
CREATE INDEX "playlist_tracks_playlistId_orderIndex_idx" ON "public"."playlist_tracks"("playlistId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_tracks_playlistId_trackId_key" ON "public"."playlist_tracks"("playlistId", "trackId");

-- AddForeignKey
ALTER TABLE "public"."playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
