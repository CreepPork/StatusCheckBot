import * as dotenv from 'dotenv';
import * as probot from 'probot';

import { IPullRequestEvent } from './interfaces';

dotenv.config();

if (! process.env.APP_ID ||
    ! process.env.WEBHOOK_SECRET ||
    ! process.env.WEBHOOK_PROXY_URL ||
    (! process.env.PRIVATE_KEY_PATH && ! process.env.PRIVATE_KEY) ||
    ! process.env.LABEL) {
        throw new Error(`Check your .env file as required data hasn't been filled.`);
}

const title = process.env.GITHUB_STATUS_TITLE || 'Is tested?';
const bodySuccess = process.env.GITHUB_STATUS_BODY_SUCCESS || 'This pull request has been tested in-game.';
const bodyFail = process.env.GITHUB_STATUS_BODY_FAILURE || `This pull request hasn't been tested in-game.`;

module.exports = (app: probot.Application) => {
    app.on(['pull_request.labeled', 'pull_request.unlabeled'], async context => {
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
            context.github.repos.createStatus({
                context: title,
                description: bodySuccess,
                owner: context.issue().owner,
                repo: context.issue().repo,
                sha: payload.pull_request.head.sha,
                state: 'success',
            }).then(response => {
                console.log(`Set pull request ${context.issue().number} status to success: ${response.status}`);
            }).catch(error => {
                console.error(`Failed to set pull request ${context.issue().number} status to success!
                ${error}`);
            });
        } else {
            context.github.repos.createStatus({
                context: title,
                description: bodyFail,
                owner: context.issue().owner,
                repo: context.issue().repo,
                sha: payload.pull_request.head.sha,
                state: 'failure',
            }).then(response => {
                console.log(`Set pull request #${context.issue().number} status to failure: ${response.status}`);
            }).catch(error => {
                console.error(`Failed to set pull request #${context.issue().number} status to failure!
                ${error}`);
            });
        }
    });
};
