const { ShardingManager } = require('discord.js');
require('dotenv').config();

const manager = new ShardingManager('./src/index.js', {
    token: process.env.TOKEN,
    totalShards: 'auto', // Discord automatically determines the best number
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn().catch(err => {
    console.error('Failed to spawn shards:', err);
});
