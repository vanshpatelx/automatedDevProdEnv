import * as os from 'os';

/**
 * Generates a unique 20-character identifier.
 * 
 * The ID is composed of three parts:
 * 1. A 4-digit segment derived from the system's hostname. Non-digit characters are removed, and the result is zero-padded to 4 digits.
 * 2. A 13-digit timestamp representing the current time in milliseconds since the Unix epoch.
 * 3. A 3-digit counter value that increments with each call and wraps around after reaching 999.
 * 
 * @returns {bigint} - A unique identifier as a BigInt.
 */

let counter = 0;
function generateUniqueId(): bigint {
  const hostname = os.hostname().replace(/\D/g, '').slice(0, 4) || '1234';
  const timestamp = Date.now();
  const counterValue = (++counter % 1000);  // range [0, 1000]
  
  const uniqueIdString = 
    timestamp.toString() +    // timestaps milliseconds
    counterValue.toString().padStart(3, '0')
    hostname.padStart(4, '0');

  const uniqueId = BigInt(uniqueIdString);
  return uniqueId;
}

export {generateUniqueId};
