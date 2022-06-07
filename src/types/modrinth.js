// Data from https://docs.modrinth.com/api-spec/

/**
 * @typedef {Object} ModrinthProject Projects can be mods or modpacks and are created by users.
 * @property {string} slug The slug of a project, used for vanity URLs
 * @property {string} title The title or name of the project
 * @property {string} description A short description of the project
 * @property {string[]} categories A list of the categories that the project is in
 * @property {'required'|'optional'|'unsupported'} client_side The client side support of the project
 * @property {'required'|'optional'|'unsupported'} server_side The server side support of the project
 * @property {string} body A long form description of the project
 * @property {?string} issues_url An optional link to where to submit bugs or issues with the project
 * @property {?string} source_url An optional link to the source code of the project
 * @property {?string} wiki_url An optional link to the project's wiki page or other relevant information
 * @property {?string} discord_url An optional invite link to the project's discord
 * @property {DonationURL[]} donation_urls A list of donation links for the project
 * @property {'mod'|'modpack'} project_type The project type of the project
 * @property {number} downloads The total number of downloads of the project
 * @property {?string} icon_url The URL of the project's icon
 * @property {string} id The ID of the project, encoded as a base62 string
 * @property {string} team The ID of the team that has ownership of this project
 * @property {?string} body_url DEPRECATED - The link to the long description of the project (only present for old projects)
 * @property {ModrinthModeratorMessage|null} moderator_message A message that a moderator sent regarding the project
 * @property {string} published The date the project was published
 * @property {string} updated The date the project was last updated
 * @property {number} followers The total number of users following the project
 * @property {'approved'|'rejected'|'draft'|'unlisted'|'archived'|'processing'|'unknown'} status The status of the project
 * @property {ModrinthLicense?} license The license of the project
 * @property {string[]} versions A list of the version IDs of the project (will never be empty unless `draft` status)
 * @property {ModrinthGalleryImage[]} A list of images that have been uploaded to the project's gallery
 */

/**
 * @typedef {Object} ModrinthVersion Versions contain download links to files with additional metadata.
 * @property {string} name The name of this version
 * @property {string} version_number The version number. Ideally will follow semantic versioning
 * @property {?string} changelog The changelog for this version
 * @property {ModrinthDependency[]} dependencies A list of specific versions of projects that this version depends on
 * @property {string[]} game_versions A list of versions of Minecraft that this version supports
 * @property {'release'|'beta'|'alpha'} version_type The release channel for this version
 * @property {string[]} loaders The mod loaders that this version supports
 * @property {boolean} featured Whether the version is featured or not
 * @property {string} id The ID of the version, encoded as a base62 string
 * @property {string} project_id The ID of the project this version is for
 * @property {string} author_id The ID of the author who published this version
 * @property {string} date_published The date the version was published
 * @property {number} downloads The number of times this version has been downloaded
 * @property {string} changelog_url DEPRECATED - A link to the changelog for this version
 * @property {ModrinthFile[]} files A list of files available for download for this version
 */

/**
 * @typedef {Object} ModrinthDependency
 * @property {?string} version_id The ID of the version that this version depends on
 * @property {?string} project_id The ID of the project that this version depends on
 * @property {'required'|'optional'|'incompatible'} dependency_type The type of dependency that this version has
 */

/**
 * @typedef {Object} ModrinthFile
 * @property {{ sha1: string, sha512: string }} hashes The hashes of the file
 * @property {string} url A direct link to the file
 * @property {string} filename The name of the file
 * @property {boolean} primary
 * @property {number} size The size of the file in bytes
 */

/**
 * @typedef {Object} ModrinthSearchResult
 * @property {?string} slug The slug of a project, used for vanity URLs
 * @property {?string} title The title or name of the project
 * @property {?string} description A short description of the project
 * @property {string[]} categories A list of the categories that the project is in
 * @property {'required'|'optional'|'unsupported'} client_side The client side support of the project
 * @property {'required'|'optional'|'unsupported'} server_side The server side support of the project
 * @property {'mod'|'modpack'} project_type The project type of the project
 * @property {number} downloads The total number of downloads of the project
 * @property {?string} icon_url The URL of the project's icon
 * @property {string} project_id The ID of the project
 * @property {string} author The username of the project's author
 * @property {string[]} versions A list of the minecraft versions supported by the project
 * @property {number} follows The total number of users following the project
 * @property {string} date_created The date the project was created
 * @property {string} date_modified The date the project was last modified
 * @property {?string} latest_version The latest version of minecraft that this project supports
 * @property {string} license The license of the project
 * @property {string[]} gallery All gallery images attached to the project
 */

/**
 * @typedef ModrinthUser
 * @property {string} username The user's username
 * @property {?string} name The user's display name
 * @property {?string} email The user's email (only your own is ever displayed)
 * @property {?string} bio A description of the user
 * @property {string} id The user's id
 * @property {number} github_id The user's github id
 * @property {string} avatar_url The user's avatar url
 * @property {string} created The time at which the user was created
 * @property {'admin'|'moderator'|'developer'} role The user's role
 */

/**
 * @typedef ModrinthTeamMember
 * @property {string} team_id The ID of the team this team member is a member of
 * @property {ModrinthUser} user
 * @property {string} role The user's role on the team
 */

/**
 * @typedef ModrinthCategory
 * @property {string} icon
 * @property {string} name
 * @property {string} project_type
 */
