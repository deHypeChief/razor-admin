import { Elysia } from 'elysia';
import cronTest from './jobs/cronTest.job'

const utils = new Elysia()
    .use(cronTest)

export default utils