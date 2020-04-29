const fmlLibsMapping = {};
// 1.3.*
const libs13 = [
  ['argo-2.25.jar', 'bb672829fde76cb163004752b86b0484bd0a7f4b', false],
  ['guava-12.0.1.jar', 'b8e78b9af7bf45900e14c6f958486b6ca682195f', false],
  ['asm-all-4.0.jar', '98308890597acb64047f7e896638e0d98753ae82', false]
];

fmlLibsMapping['1.3.2'] = libs13;

// 1.4.*
const libs14 = [
  ['argo-2.25.jar', 'bb672829fde76cb163004752b86b0484bd0a7f4b', false],
  ['guava-12.0.1.jar', 'b8e78b9af7bf45900e14c6f958486b6ca682195f', false],
  ['asm-all-4.0.jar', '98308890597acb64047f7e896638e0d98753ae82', false],
  ['bcprov-jdk15on-147.jar', 'b6f5d9926b0afbde9f4dbe3db88c5247be7794bb', false]
];

fmlLibsMapping['1.4'] = libs14;
fmlLibsMapping['1.4.1'] = libs14;
fmlLibsMapping['1.4.2'] = libs14;
fmlLibsMapping['1.4.3'] = libs14;
fmlLibsMapping['1.4.4'] = libs14;
fmlLibsMapping['1.4.5'] = libs14;
fmlLibsMapping['1.4.6'] = libs14;
fmlLibsMapping['1.4.7'] = libs14;

// 1.5
fmlLibsMapping['1.5'] = [
  ['argo-small-3.2.jar', '58912ea2858d168c50781f956fa5b59f0f7c6b51', false],
  ['guava-14.0-rc3.jar', '931ae21fa8014c3ce686aaa621eae565fefb1a6a', false],
  ['asm-all-4.1.jar', '054986e962b88d8660ae4566475658469595ef58', false],
  ['bcprov-jdk15on-148.jar', '960dea7c9181ba0b17e8bab0c06a43f0a5f04e65', true],
  [
    'deobfuscation_data_1.5.zip',
    '5f7c142d53776f16304c0bbe10542014abad6af8',
    false
  ],
  ['scala-library.jar', '458d046151ad179c85429ed7420ffb1eaf6ddf85', true]
];

// 1.5.1
fmlLibsMapping['1.5.1'] = [
  ['argo-small-3.2.jar', '58912ea2858d168c50781f956fa5b59f0f7c6b51', false],
  ['guava-14.0-rc3.jar', '931ae21fa8014c3ce686aaa621eae565fefb1a6a', false],
  ['asm-all-4.1.jar', '054986e962b88d8660ae4566475658469595ef58', false],
  ['bcprov-jdk15on-148.jar', '960dea7c9181ba0b17e8bab0c06a43f0a5f04e65', true],
  [
    'deobfuscation_data_1.5.1.zip',
    '22e221a0d89516c1f721d6cab056a7e37471d0a6',
    false
  ],
  ['scala-library.jar', '458d046151ad179c85429ed7420ffb1eaf6ddf85', true]
];

// 1.5.2
fmlLibsMapping['1.5.2'] = [
  ['argo-small-3.2.jar', '58912ea2858d168c50781f956fa5b59f0f7c6b51', false],
  ['guava-14.0-rc3.jar', '931ae21fa8014c3ce686aaa621eae565fefb1a6a', false],
  ['asm-all-4.1.jar', '054986e962b88d8660ae4566475658469595ef58', false],
  ['bcprov-jdk15on-148.jar', '960dea7c9181ba0b17e8bab0c06a43f0a5f04e65', true],
  [
    'deobfuscation_data_1.5.2.zip',
    '446e55cd986582c70fcf12cb27bc00114c5adfd9',
    false
  ],
  ['scala-library.jar', '458d046151ad179c85429ed7420ffb1eaf6ddf85', true]
];

export default fmlLibsMapping;
