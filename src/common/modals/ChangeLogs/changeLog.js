module.exports = {
  new: [
    {
      header: 'Support ARM',
      content: 'Architecture.',
      advanced: { cm: '4fd9a4', pr: '1451' }
    },
    {
      header: 'Add manual download',
      content: 'option for failed opted out mods.',
      advanced: { cm: 'a8dfa1', pr: '1512' }
    }
  ],
  improvements: [
    {
      header: 'Updated url',
      content: 'for minecraft news images.',
      advanced: { cm: 'efa324', pr: '1443' }
    },
    {
      header: 'Simplifications',
      content:
        ' to the codebase, napi and nsfw now get automatically compiled on build.',
      advanced: { cm: '20148d', pr: '1446' }
    }
  ],
  bugfixes: [
    {
      header: 'Fix asset downloading',
      content: 'now enforcing https.',
      advanced: { cm: '73b3f4', pr: '1514' }
    }
  ]
};
