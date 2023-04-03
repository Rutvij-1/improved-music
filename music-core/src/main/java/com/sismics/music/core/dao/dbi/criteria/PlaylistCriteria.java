package com.sismics.music.core.dao.dbi.criteria;

/**
 * Playlist criteria.
 *
 * @author jtremeaux
 */
public class PlaylistCriteria {
    /**
     * Playlist ID.
     */
    private String id;

    /**
     * Returns the default playlist.
     */
    private Boolean defaultPlaylist;

    /**
     * Name (like).
     */
    private String nameLike;

    /**
     * User ID.
     */
    private String userId;

    /**
     * Public status.
     */
    private Boolean isPublic;

    /**
     * If a public playlist is collaborative or not.
     */
    private Boolean isCollaborative;

    public String getId() {
        return this.id;
    }

    public PlaylistCriteria setId(String id) {
        this.id = id;
        return this;
    }

    public Boolean getDefaultPlaylist() {
        return this.defaultPlaylist;
    }

    public PlaylistCriteria setDefaultPlaylist(Boolean defaultPlaylist) {
        this.defaultPlaylist = defaultPlaylist;
        return this;
    }

    public String getNameLike() {
        return nameLike;
    }

    public PlaylistCriteria setNameLike(String nameLike) {
        this.nameLike = nameLike;
        return this;
    }

    public String getUserId() {
        return userId;
    }

    public PlaylistCriteria setUserId(String userId) {
        this.userId = userId;
        return this;
    }

    public Boolean getStatus() {
        return isPublic;
    }

    public PlaylistCriteria setStatus(Boolean isPublic) {
        this.isPublic = isPublic;
        return this;
    }

    public Boolean getCollaboration() {
        return isCollaborative;
    }

    public PlaylistCriteria setCollaboration(Boolean isCollaborative) {
        this.isCollaborative = isCollaborative;
        return this;
    }
}
