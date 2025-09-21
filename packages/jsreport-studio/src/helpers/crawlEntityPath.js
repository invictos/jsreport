/**
 * Starting from a given entity and a relative path, finds the target entity.
 */
export default function crawlEntityPath(entities, path, startingEntity) {
    // Shortid map for quick access
    const byShortid = {
    };
    for (const el of entities) {
        if (el.shortid) byShortid[el.shortid] = el;
    }
    
    // Find the current folder
    let folderShortid = null
    if (!path.startsWith('/') && startingEntity && startingEntity.folder) {
        folderShortid = startingEntity.folder.shortid;
    }

    // Split the path
    const parts = path.split('/').filter(Boolean);

    // Traverse the parts except the last one (which is the name of the target entity)
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part === '..') {
            // Go up one folder
            const folder = byShortid[folderShortid];
            if (!folder) return null;
            folderShortid = folder.folder ? folder.folder.shortid : null;
        } else {
            // Go down into a named subfolder
            const subfolder = entities.find(
                e => e.__entitySet === 'folders' && e.name === part && (
                    (folderShortid == null && !e.folder) || e.folder && e.folder.shortid === folderShortid
                )
            );
            if (!subfolder) return null;
            folderShortid = subfolder.shortid;
        }
    }

    // Find the target entity in the final folder
    const name = parts[parts.length - 1];
    const found = entities.find(
        e => e.name === name && e.folder && e.folder.shortid === folderShortid
    );
    
    return found || null;
}