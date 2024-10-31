const core = require('@actions/core');
const Dates = require('./utils/dates');
const CheckCertificate = require('./tasks/check-certificate');
const CheckPaidTillDate = require('./tasks/check-paid-till-date');

try {
    /**
     * Site domain to be checked
     * @type {string}
     */
    const URL = core.getInput('url');
    const CHECK_ACTION = core.getInput('check_action');

    core.info("url", `{URL}`);
    core.info("check action", `{check_action}`);
    core.setOutput("action", CHECK_ACTION);

    // if (CHECK_ACTION == "ssl") {
    //     core.setOutput("run-action", "ssl");
    //     /**
    //      * Check SSL certificate
    //      */
    //     CheckCertificate(URL)
    //         .then(date => {
    //             core.setOutput("ssl-expire-date", date.toString());
    //             core.setOutput("ssl-expire-days-left", Dates.countDays(date));
    //         })
    //         .catch(error => {
    //             if (error.code === 'CERT_HAS_EXPIRED') {
    //                 core.setOutput("ssl-expire-date", "INVALID");
    //                 core.setOutput("ssl-expire-days-left", -1);
    //             }

    //             throw error;
    //         })
    //         .catch(core.error);
    // }

    // if (CHECK_ACTION == "registry") {
    //     core.setOutput("run-action", "registry");
    //     /**
    //      * Check domain's registry expiry date
    //      */
    //     CheckPaidTillDate(URL)
    //         .then(date => {
    //             core.setOutput("paid-till-date", date.toString());
    //             core.setOutput("paid-till-days-left", Dates.countDays(date));
    //         })
    //         .catch(core.error);
    // }
} catch (error) {
    core.setFailed(error.message);
}
