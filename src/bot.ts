import * as dotenv from 'dotenv';
import * as probot from 'probot';

import { IPullRequestEvent } from './interfaces';

dotenv.config();

if (! process.env.APP_ID ||
    ! process.env.WEBHOOK_SECRET ||
    ! process.env.WEBHOOK_PROXY_URL ||
    ! process.env.PRIVATE_KEY_PATH ||
    ! process.env.LABEL) {
        throw new Error(`Check your .env file as required data hasn't been filled.`);
}

module.exports = (app: probot.Application) => {
    // TODO: Doesn't fire on unlabeled
    app.on('pull_request.labeled', async context => {
        let foundLabel = false;

        const payload: IPullRequestEvent = context.payload;

        const labels = payload.pull_request.labels;
        if (labels) {
            labels.forEach(label => {
                if (label.name === process.env.LABEL) {
                    foundLabel = true;
                }
            });
        }

        if (foundLabel) {
            // Add CI Check
            console.log('Found the label!');
        } else {
            // Set CI check to fail
            console.log(`Where's the label?!`);
        }
    });
};
