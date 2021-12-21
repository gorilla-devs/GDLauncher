module.exports = {
  new: [],
  improvements: [
    {
      header: 'Instance resources will now be checked at startup.',
      content: 'If they are missing they will be downloaded again.',
      advanced: { cm: 'd970328' }
    }
  ],
  bugfixes: [
    {
      header: 'Deprecated our old cdn',
      content: 'in favor of the new one.',
      advanced: { cm: 'dbc658f' }
    }
  ]
};
