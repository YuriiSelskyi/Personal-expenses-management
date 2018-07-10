const readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout),
	fetch = require('node-fetch'),
	prefix = '> ';

const list = {};
let currencies = {};

const defineCommand = (command, line) => {
	return line.indexOf(command) == 0 && line.charAt(command.length) == false;
};

const add = (date, data) => {
	if (list[date]) {
		list[date].push(data);
	} else {
		list[date] = [data];
	}
};

const clear = (date) => {
	delete list[date];
};

const total = (currency) => {
	let sum = 0;
	Object.keys(list).forEach(key => list[key].forEach(data => {
		const currentCurrencyRate = getCurrencyRate(data.currency);
		sum += Number(data.number) / currentCurrencyRate * currencies[currency];
	}));
	console.log(sum.toFixed(2), currency);
};

const getCurrencyRate = (currency) => {
	return currencies[currency]
};

const getList = () => {
	Object.keys(list).forEach(key => {
		console.log();
		console.log(key);
		list[key].forEach(data => console.log(data.number, data.currency, data.description));
		console.log();
	});
};

const getCurrencies = () => {
	fetch('http://data.fixer.io/api/latest?access_key=3a05161476264416ba461c73896c4478')
		.then(res => res.json())
		.then(res => currencies = res.rates);
};

const validateCurrency = (currency) => {
	return !!currencies[currency];
};

rl.on('line', (line) => {
	line = line.trim();

	if (defineCommand("add", line)) {

		const [command, date, number, currency, ...description] = line.split(' ');
		if (new Date(date) != 'Invalid Date' && !isNaN(number) && validateCurrency(currency) && description) {
			add(date, { number, currency, description: description.join(' ') });
			getList();
		} else {
			console.log('Inavalid data');
		}
		
	} else if (defineCommand("list", line)) {

		getList();

	} else if (defineCommand("clear", line)) {

		const [command, date] = line.split(' ');
		clear(date);
		getList();

	} else if (defineCommand("total", line)) {

		const [command, currency] = line.split(' ');
		if (validateCurrency(currency)) {
			total(currency);
		} else {
			console.log('Inavalid data');
		}
		
	} else {
		console.log("Unknown command");
	}
	rl.setPrompt(prefix, prefix.length);
	rl.prompt();
}).on('close', () => {
	process.exit(0);
});

getCurrencies();

rl.setPrompt(prefix, prefix.length);
rl.prompt();