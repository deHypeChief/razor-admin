import Elysia from "elysia";
import {cron, Patterns } from "@elysiajs/cron";

const cronTest = new Elysia()
    .use(
        cron({
            name: 'CronTesting',
            pattern: Patterns.everyMinutes(),
            run() {
                console.log('CronTesting')
            }
        })
    );

export default cronTest