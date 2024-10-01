import Parser from 'rss-parser';
import { formatDistance } from 'date-fns';
import { stripHtml } from "string-strip-html";

const parser = new Parser()

const EXCLUDED_COUNTRIES = ['India', 'Bangladesh', 'Nigeria', 'Ghana', 'Pakistan']
const EXCLUDED_WORDS = ['Expensify']
const PREFERRED_WORDS = [
    "laravel",
    "php",
    "vue",
    "mysql",
    "tailwindcss",
    "nuxt",
    "nextjs",
    "letsencrypt",
    "let's encrypt",
    "digitalocean",
    "lightsail",
    "cloudformation",
    "ec2",
    "nest",
    "react",
];



const parsePost = (item) => {
    const content = stripHtml(item.content).result;
    const url = new URL(item.link);
    const postId = url.pathname.split('%7E')[1];
    const hourlyRate = content.split('Hourly Range').length > 1 ? content.split('Hourly Range')[1].split('\n')[0].substring(2) : 'Unknown';
    const fixedPrice = content.split('Fixed-price').length > 1 ? content.split('Fixed-price')[1].split('\n')[0].substring(2) : 'Unknown';

    const country = content.split('Country')[1].split('\n')[0].substring(2);

    return {
        postId,
        title: item.content,
        url,
        content,
        hourlyRate,
        fixedPrice,
        country,
    }
}

const getMatchedItems = async () => {
    const MY_CATEGORIES_FEED = new URL('https://www.upwork.com/ab/feed/topics/rss')
    MY_CATEGORIES_FEED.searchParams.append('securityToken', '2f2e5cd74027f792356fe75c385ffb19fbace9f9d511dbb30f5fcc1541917b275b353fae0a84ec638a23e3360d80b36052c763ecdd41b5b6c5cb8f4449085268')
    MY_CATEGORIES_FEED.searchParams.append('userUid', '1484885580968288256')
    MY_CATEGORIES_FEED.searchParams.append('orgUid', '1484885580968288257')
    MY_CATEGORIES_FEED.searchParams.append('category2_uid', '531770282580668418');
    MY_CATEGORIES_FEED.searchParams.append('verified_payment_only', '1');
    MY_CATEGORIES_FEED.searchParams.append('sort', 'recency');
    MY_CATEGORIES_FEED.searchParams.append('paging', '0;30');
    MY_CATEGORIES_FEED.searchParams.append('api_params', '1');

    MY_CATEGORIES_FEED.searchParams.append('job_type', 'hourly,fixed');
    MY_CATEGORIES_FEED.searchParams.append('contractor_tier', '2,3');
    MY_CATEGORIES_FEED.searchParams.append('client_hires', '1-9,10-');
    MY_CATEGORIES_FEED.searchParams.append('proposals', '0-4,5-9,10-14,15-19');
    MY_CATEGORIES_FEED.searchParams.append('budget', '100-499,500-999,1000-4999,5000-');

    const posts = [];

    try {
        let feed = await parser.parseURL(MY_CATEGORIES_FEED.href)

        console.log(`Posts found ${feed.items.length}`);

        feed.items.forEach(item => {
            const post = parsePost(item);
            const { content, postId, country, title, hourlyRate } = post;

            let isMatched = PREFERRED_WORDS.some(function (word) {
                return (content.toLowerCase().indexOf(word) !== -1) || (title.toLowerCase().indexOf(word) !== -1);
            });

            // isMatched = EXCLUDED_WORDS.filter(function (word) {
            //     return (content.toLowerCase().indexOf(word) === -1) || (title.toLowerCase().indexOf(word) === -1);
            // }).length == 0;

            if (isMatched && !EXCLUDED_COUNTRIES.includes(country)) {
                posts.push({
                    id: postId,
                    content: content,
                    title: item.title,
                    time: formatDistance(new Date(item.isoDate), new Date(), { addSuffix: true }),
                    info: `\nCountry: ${country}\nHourly Rate: ${hourlyRate}`,
                    url: `https://www.upwork.com/jobs/Need-web-developer_~${postId}`
                })
            }
        });
    } catch (error) {
        console.log(error);
    }
    console.log(`Matched posts: ${posts.length}`);
    return posts;
};

export { getMatchedItems }