require('dotenv').config();

const puppeteer = require('puppeteer');
const fields = require('./fields');
const options = require('./puppeteer_options');
const pizza_types = require('./pizza_types');
const {timeout, waitUntil} = options.timeout;

const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

const address_number = process.env.ADDRESS.match(/^(\d){1,}/g)[0];
const addr = process.env.ADDRESS.toLocaleUpperCase().split(',');
const regex = /^(\d){1,}(\s){1}/g;
const street_name = `${addr[0].replace(regex, "")}`;
const state = addr[2].replace(/\s/g, '');

const edit_profile = false;

const current_date = new Date();


 const waitForSelectorThenClick = async (page, selector) => {
     console.log(selector);

     await page.waitForSelector(selector, {timeout, waitUntil});

     await page.evaluate(`$("${selector}")[0].click()`);
 };

const dominos = async (req, res) => {

    console.time();

    const PIZZA_TYPE_SELECTOR = pizza_types['CHICKEN-SUPREME'];

    const browser = await puppeteer.launch({
        timeout,
        headless: options.headless,
        userDataDir: `${options.userDataDir}`, args: [
        '--disable-extensions-except=./chrome_extension/',
        '--load-extension=./chrome_extension/'
    ]
    });
    let page = await browser.newPage();

    process.browser = browser;
    process.page = page;

    await page.setJavaScriptEnabled(options.javascriptEnabled);

    await page.setCacheEnabled(options.cacheEnabled);

    await page.goto('https://www.dominos.ng', {timeout});

    await sleep(5000);
    try{
        await page.click(fields.START_NEW_ORDER_BUTTON);
    }catch(e){
        console.log("No previous order was made");
    }

    await waitForSelectorThenClick(page, fields.SIGN_IN_MODAL_SELECTOR);

    await page.keyboard.type(process.env.EMAIL);

    await page.click(fields.LOGIN_PASSWORD_ID);
    await page.keyboard.type(process.env.PASSWORD);

    await page.click(fields.BUTTON_SELECTOR);

    await sleep(5000);

    if(edit_profile) {
        await waitForSelectorThenClick(page, fields.PROFILE_PAGE_SELECTOR);
        await waitForSelectorThenClick(page, fields.EDIT_PROFILE_PAGE_SELECTOR);

        await sleep(5000);

        await waitForSelectorThenClick(page, fields.EDIT_PROFILE_BUTTON_SELECTOR);
        await page.evaluate(`$("input#Phone")[0].value = ${process.env.PHONE}`);
        await page.click(fields.EDIT_PROFILE_PAGE_BUTTON_SELECTOR);

        await sleep(5000);

        await waitForSelectorThenClick(page, fields.ADD_ADDRESS_LINK_SELECTOR);
        await page.evaluate(`$("select#City")[0].value = "${state}"`);

        await page.evaluate(`$("${fields.STREET_NAME_INPUT_ADDRESS_SELECTOR}")[0].disabled = false`);
        await waitForSelectorThenClick(page, fields.STREET_NAME_INPUT_ADDRESS_SELECTOR);
        await page.keyboard.type(street_name);

        await sleep(5000);
        const closest_location = await page.evaluate(`$("ul.address-typeahead__predictions.js-addressPredictions li:first-child")[0].textContent`);
        const similarity = require('string-similarity').compareTwoStrings(closest_location, street_name);

        if (similarity > 0.6) {
            console.log("We have a good location");

            await page.evaluate(`$("ul.address-typeahead__predictions.js-addressPredictions li:first-child")[0].click()`);
            await page.evaluate(`$("${fields.STREET_NUMBER_INPUT_ADDRESS_SELECTOR}")[0].value = "${address_number}"`);
            await page.evaluate(`$("${fields.STREET_ADDRESS_CHECKBOX_DEFAULT_SELECTOR}")[0].checked = true`);
            await page.click(fields.ADD_ADDRESS_BUTTON_SELECTOR);
            await waitForSelectorThenClick(page, fields.CLOSE_OVERLAY_BUTTON);
        } else {
            console.log("Dominos doesn't deliver to your location");
        }
    }

    await page.click(fields.ORDER_ONLINE_LINK_SELECTOR);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.ORDER_DELIVERY_BUTTON_SELECTOR);

    await waitForSelectorThenClick(page, fields.ORDER_DELIVERY_CONTINUE_BUTTON_SELECTOR);

    await waitForSelectorThenClick(page, fields.ORDER_PIZZA_LINK);

    if(9 > current_date.getHours() || current_date.getHours() > 23){
        console.log("Dominos is closed, order for a future time");

        await page.evaluate(`$('${fields.FUTURE_TIME_SELECT_SELECTOR}')[1].value = '10:00:00'`);
        await waitForSelectorThenClick(page, "button.btn--future-time");
    } else {
        console.log("You're within work hours")
    }

    await sleep(10000);

    // await waitForSelectorThenClick(page, fields.ORDER_PIZZA_DELIVERY_LINK);
    await waitForSelectorThenClick(page, PIZZA_TYPE_SELECTOR);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.CHECKOUT_PIZZA_DELIVERY_LINK);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.NO_THANKS_OVERLAY_LINK);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.CONTINUE_CHECKOUT_LINK);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.ACCEPT_TOS_CHECKBOX_SELECTOR);

    await waitForSelectorThenClick(page, fields.PAY_WITH_INTERSWITCH_CHECKBOX);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.PROCEED_T0_PAYMENT_BUTTON);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.PROCEED_TO_INTERSWITCH_BUTTON);

    await sleep(5000);

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_CC);
    await page.keyboard.type(process.env.CARD_NUMBER);

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_MONTH_YEAR);
    await page.keyboard.type(process.env.MONTH_AND_YEAR);

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_MONTH_YEAR);
    await page.keyboard.type(process.env.MONTH_AND_YEAR);

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_CVV);
    await page.keyboard.type(process.env.CVV);

    await page.evaluate(`$("${fields.INTERSWITCH_PAYMENT_CARD_PIN}")[0].value = ${process.env.PIN}`);

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_SUBMIT_BUTTON);

    await sleep(5000);

    const otp = await question('What is the OTP? ');

    await waitForSelectorThenClick(page, fields.INTERSWITCH_PAYMENT_PAYMENT_TOKEN);
    await page.keyboard.type(otp);
    await page.click(fields.INTERSWITCH_PAYMENT_OTP_SUBMIT_BUTTON);

    console.timeEnd();

    return res.status(200).json({
        message: "Dominos pizza ordered successfully",
        status: "OK",
    })
};

module.exports = { dominos };