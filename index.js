const core = require('@actions/core');
const Dates = require('./utils/dates');
const CheckCertificate = require('./tasks/check-certificate');
const CheckPaidTillDate = require('./tasks/check-paid-till-date');
const {createOrUpdateIssue, generateIssueContent} = require('./issue')

class Domain {
    constructor(name, daysLeft, expireDate) {
        this.name = name;
	this.daysLeft = daysLeft;
	this.expireDate = expireDate;
    }
}

try {
    /**
     * Site domain to be checked
     * @type {string}
     */
    const URLS = core.getInput('urls')
	             .trim()
		     .split(/[\r\n]/)
                     .map(line => line.trim())
                     .filter(line => line !== '');
    const CHECK_ACTION = core.getInput('check_action');
    const MINIMUM_LEFT_DAYS = core.getInput('minimum_left_days');
    const ASSIGNEES = core.getInput('assignees');

    core.setOutput("action", CHECK_ACTION);
    core.info("urls raw: ", core.getInput('urls'))
    core.info("urls: ", `{urls}`)

    records = []

    if (CHECK_ACTION == "ssl") {
        core.setOutput("run-action", CHECK_ACTION);
        /**
         * Check SSL certificate
         */
	URLS.forEach((url) => {
            var daysLeft, expireDate;
	    core.info("url: ", `{url}`)
            CheckCertificate(url)
                .then(date => {
		    daysLeft = Dates.countDays(date);
		    expireDate = date.toString();
                })
                .catch(error => {
                    if (error.code === 'CERT_HAS_EXPIRED') {
			daysLeft = -1
			expireDate = "INVALID"
                    }

                    throw error;
                })
                .catch(core.error);
	    if (daysLeft !== undefined && expireDate !== undefined) {
		if (daysLeft < MINIMUM_LEFT_DAYS) {
		    records.push(Domain(url, daysLeft, expireDate))
		}
	    }
	});
    }

    if (CHECK_ACTION == "registry") {
        core.setOutput("run-action", CHECK_ACTION);
        /**
         * Check domain's registry expiry date
         */
	URLS.forEach((url) => {
	    core.info("url: ", `{url}`)
            var daysLeft, expireDate;
            CheckPaidTillDate(URL)
                .then(date => {
		    daysLeft = Dates.countDays(date);
		    expireDate = date.toString();
                })
                .catch(core.error);
	    if (daysLeft !== undefined && expireDate !== undefined) {
		if (daysLeft < MINIMUM_LEFT_DAYS) {
		    records.push(Domain(url, daysLeft, expireDate))
		}
	    }
	});
    }

    if (records.length > 0) {
	(async () => {
            issueBody = await generateIssueContent(records, CHECK_ACTION)
	    core.setOutput("issue-body", `{issueBody}`)
            issue = await createOrUpdateIssue(records, CHECK_ACTION, ASSIGNEES)
	    core.info(`Successful.`)
        })()
    }

} catch (error) {
    core.setFailed(error.message);
}
