const soap = require('soap');
const parse = require('xml-parser');
const util = require('util')
const config = require('./config')

const dumpLineBreak = () => {
  console.log('========================================================================');
};

const getListOfMethods = (client) => {
  const listOfAPIFunctions = {
    sync: [],
    async: [],
  };
  Object.keys(client).forEach((name) => {
    if (typeof client[name] === 'function') {
      if (name.includes('Async')) {
        listOfAPIFunctions.async.push(name);
      } else {
        listOfAPIFunctions.sync.push(name);
      }
    }
  });
  listOfAPIFunctions.sync.sort();
  listOfAPIFunctions.async.sort();
  console.log({ listOfAPIFunctions });
  dumpLineBreak();
};

const parseResponse = (response) => {
  console.log(util.inspect(response[0].return, false, null, true));
  // console.log(util.inspect(parse(response[1]), false, null, true));
  // console.log(response[2]);
  // console.log(util.inspect(parse(response[3]), false, null, true));
  dumpLineBreak();
};

const parseAvailableFunctions = (response) => {
  const list = response[0].return.item;
  console.log(util.inspect(
    list.map(item => ({
      title: item.title['$value'],
      module: item.module['$value'],
      func: item.func['$value'],
      documenttype: item.documenttype['$value'],
    })),
    false,
    null,
    true
  ));
  dumpLineBreak();
};

const doStuff = async () => {
  try {

    const client = await soap.createClientAsync(config.url);

    getListOfMethods(client);

    const version = await client.getVersionAsync(null);
    parseResponse(version);

    const login = await client.loginAsync({
      user: 'Alice',
      pass: 'Cooper321',
    });
    // parseResponse(login);
    const sessionId = login[0].return.sessionid['$value'];
    console.log('[!] ', { sessionId });

    const availableFunctionsList = await client.getAvailableFunctionsAsync({ sessionId });
    parseAvailableFunctions(availableFunctionsList);

    const currencyInfo = await client.getCurrencyInfoAsync({ sessionId });
    parseResponse(currencyInfo);

    const accounts = await client.getAccountsAsync({ sessionId });
    parseResponse(accounts);

    const balance = await client.getBalanceAsync({ sessionId });
    parseResponse(balance);

    const balances = await client.getBalancesAsync({ sessionId });
    parseResponse(balances);
  } catch (e) {
    console.error(e);
  }
};

doStuff();
