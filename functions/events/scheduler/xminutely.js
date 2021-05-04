const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

const TWITTER_QUERY = 'ON (mississauga OR peel) (from:vaxhunterscan)';
const DISCORD_CHANNEL_NAME = 'peel';

const res = { twitter: {} };

/** https://autocode.com/lib/utils/kv/#get */
const previous_id_str = await lib.utils.kv.get({
	key: 'id_str'
});

/** https://autocode.com/lib/twitter/tweets/#search-tweets-list */
res.twitter.returnValue = await lib.twitter.tweets['@1.1.1'].search.tweets.list(
	{
		q: TWITTER_QUERY,
		since_id: `${previous_id_str}`,
		tweet_mode: 'extended'
	}
);

const { statuses } = res.twitter.returnValue;

// DEBUG
console.log(`previous_id_str: ${previous_id_str}`);
console.log(`statuses.length: ${statuses.length}`);

if (statuses.length > 0) {
	const status = statuses[0];

	const current_id_str = status.id_str;
	const full_text = status.full_text;

	await lib.utils.kv.set({
		key: 'id_str',
		value: current_id_str
	});

	/** https://autocode.com/lib/discord/channels/#messages-create */
	await lib.discord.channels['@0.0.3'].messages.create({
		channel_name: DISCORD_CHANNEL_NAME,
		content: full_text
	});
}
