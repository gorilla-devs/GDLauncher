
/**
 * @roxi/routify 2.18.4
 * File generated Mon Jan 03 2022 19:05:35 GMT+0100 (Central European Standard Time)
 */

export const __version = "2.18.4"
export const __timestamp = "2022-01-03T18:05:35.989Z"

//buildRoutes
import { buildClientTree } from "@roxi/routify/runtime/buildRoutes"

//imports


//options
export const options = {}

//tree
export const _tree = {
  "root": true,
  "children": [
    {
      "isIndex": true,
      "isPage": true,
      "path": "/index",
      "id": "_index",
      "component": () => import('../src/pages/index.svelte').then(m => m.default)
    }
  ],
  "path": "/"
}


export const {tree, routes} = buildClientTree(_tree)

