module.exports = {
  new: [
    {
      header: 'Tinkering whit the changelog modal',
      content: 'Hope it will work :)',
      advanced: { cm: 'commitHash' }
    }
  ],
  improvements: [
    {
      header: 'We improved',
      content: 'some stuff',
      advanced: { cm: 'commitHash', pr: 'pullNr' }
    }
  ],
  bugfixes: [
    {
      header: 'Fixed crash',
      content: 'when doing stuff',
      advanced: { cm: 'commitHash', pr: 'pullNr/commitHash' }
    }
  ]
};
