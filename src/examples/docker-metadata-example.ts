/**
 * Example usage of the Docker metadata fetching functionality
 * 
 * This file demonstrates how to use the comprehensive Docker image metadata
 * fetching system that handles all manifest types (manifest lists, schema v2, 
 * OCI, and legacy schema v1).
 */

import { getImageMetadata, getImageMetadataForPlatform } from '@/lib/api';
import { formatBytes, formatPlatform, isMultiArch } from '@/lib/docker-metadata-utils';

// Example 1: Fetch metadata for a single-architecture image
export async function fetchSingleArchExample() {
  try {
    console.log('Fetching metadata for nginx:latest...');
    const metadata = await getImageMetadata('nginx', 'latest');
    
    console.log(`Found ${metadata.length} platform(s)`);
    
    for (const meta of metadata) {
      console.log(`Platform: ${formatPlatform(meta.platform)}`);
      console.log(`Size: ${formatBytes(meta.size)}`);
      console.log(`Layers: ${meta.layers.length}`);
      console.log(`Created: ${meta.config.created || 'Unknown'}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Example 2: Fetch metadata for a multi-architecture image
export async function fetchMultiArchExample() {
  try {
    console.log('Fetching metadata for alpine:latest...');
    const metadata = await getImageMetadata('alpine', 'latest');
    
    if (isMultiArch(metadata)) {
      console.log(`Multi-architecture image with ${metadata.length} platforms:`);
      
      for (const meta of metadata) {
        console.log(`- ${formatPlatform(meta.platform)}: ${formatBytes(meta.size)}`);
      }
    } else {
      console.log('Single architecture image');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Example 3: Fetch metadata for a specific platform
export async function fetchSpecificPlatformExample() {
  try {
    console.log('Fetching metadata for linux/amd64 platform...');
    const metadata = await getImageMetadataForPlatform('alpine', 'latest', {
      os: 'linux',
      architecture: 'amd64'
    });
    
    if (metadata) {
      console.log('Found matching platform:');
      console.log(`Platform: ${formatPlatform(metadata.platform)}`);
      console.log(`Size: ${formatBytes(metadata.size)}`);
      console.log(`Digest: ${metadata.digest}`);
      console.log(`Media Type: ${metadata.mediaType}`);
      
      if (metadata.config.env) {
        console.log(`Environment Variables: ${metadata.config.env.length}`);
      }
      
      if (metadata.config.labels) {
        console.log(`Labels: ${Object.keys(metadata.config.labels).length}`);
      }
    } else {
      console.log('No matching platform found');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Example 4: Compare different platforms of the same image
export async function comparePlatformsExample() {
  try {
    console.log('Comparing platforms for busybox:latest...');
    const metadata = await getImageMetadata('busybox', 'latest');
    
    console.log('Platform comparison:');
    console.log('Platform\t\tSize\t\tLayers');
    console.log('--------\t\t----\t\t------');
    
    for (const meta of metadata) {
      const platform = formatPlatform(meta.platform).padEnd(16);
      const size = formatBytes(meta.size).padEnd(12);
      const layers = meta.layers.length.toString();
      
      console.log(`${platform}\t${size}\t${layers}`);
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Example 5: Analyze image configuration
export async function analyzeConfigExample() {
  try {
    console.log('Analyzing configuration for node:18-alpine...');
    const metadata = await getImageMetadata('node', '18-alpine');
    
    for (const meta of metadata) {
      console.log(`\nPlatform: ${formatPlatform(meta.platform)}`);
      
      if (meta.config.cmd) {
        console.log(`Default Command: ${meta.config.cmd.join(' ')}`);
      }
      
      if (meta.config.env) {
        console.log(`Environment Variables (${meta.config.env.length}):`);
        meta.config.env.slice(0, 5).forEach(env => {
          console.log(`  ${env}`);
        });
        if (meta.config.env.length > 5) {
          console.log(`  ... and ${meta.config.env.length - 5} more`);
        }
      }
      
      if (meta.config.labels) {
        console.log(`Labels (${Object.keys(meta.config.labels).length}):`);
        Object.entries(meta.config.labels).slice(0, 3).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        if (Object.keys(meta.config.labels).length > 3) {
          console.log(`  ... and ${Object.keys(meta.config.labels).length - 3} more`);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Run all examples
export async function runAllExamples() {
  console.log('=== Docker Metadata Fetching Examples ===\n');
  
  await fetchSingleArchExample();
  console.log('\n');
  
  await fetchMultiArchExample();
  console.log('\n');
  
  await fetchSpecificPlatformExample();
  console.log('\n');
  
  await comparePlatformsExample();
  console.log('\n');
  
  await analyzeConfigExample();
  console.log('\n=== Examples Complete ===');
}
