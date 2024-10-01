import { Telegraf, Markup } from 'telegraf';
import { getMatchedItems } from "./scraper.js";

const bot = new Telegraf('PLACE_YOUR_TG_KEY');

let notifiedPosts = []
let intervalId = null;
let DURATION_IN_SECONDS = 2;

const commands = [
    {
        "command": "start",
        "description": "To start the bot"
    },
    {
        "command": "help",
        "description": "Display help"
    },
    {
        "command": "status",
        "description": "To check if the bot is running"
    },
    {
        "command": "set_interval",
        "description": "To change interval duration"
    },
    {
        "command": "clear_ids",
        "description": "To clear notified ids"
    }
]

const startInterval = () => {
    intervalId = setInterval(async () => {
        const posts = await getMatchedItems();

        posts.forEach(post => {
            if (!notifiedPosts.includes(post.id)) {
                bot.telegram.sendMessage(5865932985, {
                    text: `${post.title} \n\n${post.content.substr(0, 400)} \n\n${post.info} \n\n${post.time} \n\n${post.url}`,
                })

                notifiedPosts.push(post.id)
            }
        })
    }, DURATION_IN_SECONDS * 1000)
}

const stopInterval = () => {
    if (intervalId) clearInterval(intervalId);
}

bot.telegram.setMyCommands(commands, {
    language_code: "en"
})

bot.start((ctx) => {
    ctx.reply('✅ Bot started.');
    startInterval()
});

bot.command('stop', (ctx) => {
    stopInterval();
    ctx.reply('✅ Bot stopped.');
});

bot.command('status', (ctx) => {
    ctx.reply(intervalId ? '✅ Bot is running' : '❌ Bot is not running.');
});

bot.command('set_interval', ctx => {
    ctx.reply('Please choose an option:',
        Markup.inlineKeyboard([
            Markup.button.callback('2s', 'set_2s_interval'),
            Markup.button.callback('5s', 'set_5s_interval'),
            Markup.button.callback('10s', 'set_10s_interval'),
            Markup.button.callback('20s', 'set_20s_interval')
        ])
    );
})

bot.action('set_2s_interval', ctx => {
    stopInterval();
    DURATION_IN_SECONDS = 2;
    startInterval();
})

bot.action('set_5s_interval', ctx => {
    stopInterval();
    DURATION_IN_SECONDS = 5;
    startInterval();
})


bot.action('set_10s_interval', ctx => {
    stopInterval();
    DURATION_IN_SECONDS = 10;
    startInterval();
})

bot.action('set_20s_interval', ctx => {
    stopInterval();
    DURATION_IN_SECONDS = 20;
    startInterval();
})

bot.command('clear_ids', (ctx) => {
    notifiedPosts = [];

    ctx.reply('✅ ID cleared.')
});

bot.launch();
