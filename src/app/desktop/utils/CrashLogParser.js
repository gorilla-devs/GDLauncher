// import { defaults } from 'lodash';
/* eslint-disable*/
const headers = {
  CRASH_REPORT: '---- Minecraft Crash Report ----',
  SYSTEM_DETAILS: '-- System Details --',
  HEAD: '-- Head --',
  INIZIALIZATION: '-- Initialization --'
};

// Constant index where some data is in the crashlog
const indexes = {
  DETAILS: null,
  TIME: null,
  DESCRIPTION: null,
  MINECRAFT_VERSION: null,
  OPERATING_SYSTEM: null,
  JAVA_VERSION: null,
  MEMORY: null
};

// function findPossibleCause(error) {
//   if (error.match('OutOfMemoryError')) {
//     return 'Ran out of RAM, allocate more memory to Minecraft';
//   }

//   return 'Unknown';
// }

export default function parseCrashlog(crashlog) {
  const lines = crashlog.split('\n');

  //   console.log('lines', lines);

  if (lines.length < 1 || lines[0] !== headers.CRASH_REPORT) {
    throw new Error('Invalid crashlog');
  }

  // const index = 0;
  const data = {};

  lines.forEach((x, i) => {
    if (x.includes('Time')) {
      indexes.TIME = i;
    } else if (x.includes('Description')) {
      indexes.DESCRIPTION = i;
    } else if (x.includes('Minecraft Version') && !x.includes('ID')) {
      indexes.MINECRAFT_VERSION = i;
    } else if (x.includes('Operating System')) {
      indexes.OPERATING_SYSTEM = i;
    } else if (x.includes('Java Version')) {
      indexes.JAVA_VERSION = i;
    } else if (x.includes('Memory')) {
      indexes.MEMORY = i;
    }
  });
  data.time = lines[indexes.TIME].match(/Time: (.*)/)[1];
  data.description = lines[indexes.DESCRIPTION].match(/Description: (.*)/)[1];

  //   // Move to system details
  //   while (!lines[index].includes(headers.SYSTEM_DETAILS)) {
  //     index++;
  //   }

  const systemDetails = {
    minecraftVersion: lines[indexes.MINECRAFT_VERSION].match(
      /Minecraft Version: (.*)/
    )[1],
    operatingSystem: lines[indexes.OPERATING_SYSTEM].match(
      /Operating System: (.*)/
    )[1],
    javaVersion: lines[indexes.JAVA_VERSION].match(/Java Version: (.*)/)[1]
  };

  const memoryInfo = lines[indexes.MEMORY].match(
    /Memory: (.*?) \/ (.*?)up to (.*)/
  );
  systemDetails.memory = {
    used: memoryInfo[1],
    available: memoryInfo[2],
    max: memoryInfo[3]
  };

  data.systemDetails = systemDetails;
  return data;
}
