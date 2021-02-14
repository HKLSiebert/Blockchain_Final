/* Check if Metamask is installed. */
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
} else {
    console.log('Please install MetaMask or another browser-based wallet');
}

/* Instantiate a Web3 client that uses Metamask for transactions.  Then,
 * enable it for the site so user can grant permissions to the wallet */
const web3 = new Web3(window.ethereum);
window.ethereum.enable();

/* Grab ABI from compiled contract (e.g. in Remix) and fill it in.
 * Grab address of contract on the blockchain and fill it in.
 * Use the web3 client to instantiate the contract within program */
var AllowanceABI = [{"name":"Entry","inputs":[{"type":"uint256","name":"value","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"uint256","name":"total"},{"type":"string","name":"task1"},{"type":"uint256","name":"reward1"},{"type":"string","name":"task2"},{"type":"uint256","name":"reward2"},{"type":"string","name":"task3"},{"type":"uint256","name":"reward3"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"complete","outputs":[],"inputs":[{"type":"string","name":"desiredTask"}],"stateMutability":"nonpayable","type":"function","gas":217447},{"name":"confirmation","outputs":[],"inputs":[{"type":"string","name":"desiredTask"}],"stateMutability":"payable","type":"function","gas":625623},{"name":"reject","outputs":[],"inputs":[{"type":"string","name":"desiredTask"}],"stateMutability":"nonpayable","type":"function","gas":131646},{"name":"v_getRewardVal","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"string","name":"arg"}],"stateMutability":"view","type":"function","gas":7337},{"name":"cashOut","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":26229},{"name":"v_getBalance","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":503},{"stateMutability":"payable","type":"fallback"},{"name":"owner","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1331},{"name":"tl","outputs":[{"type":"address","name":"claimant"},{"type":"string","name":"message"},{"type":"uint256","name":"bounty_entry"},{"type":"bool","name":"completed"}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":10143}];

var Allowance = new web3.eth.Contract(AllowanceABI,'0x6BeC57Fccbb0c9B97534aC07bed1C7852defb214');

/* ================================================================================*/
/* Update the UI with current wallet account address when called */
async function updateAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const accountNode = document.getElementById("account");
  if (accountNode.firstChild)
    accountNode.firstChild.remove();
  var textnode = document.createTextNode(account);
  accountNode.appendChild(textnode);
}

/* ================================================================================*/
/* Update the UI with Guestbook entries from contract when called */
async function updateEntries(){
  const entriesNode = document.getElementById("entries");

  while (entriesNode.firstChild) {
    entriesNode.firstChild.remove();
  }

  for (var i = 0 ; i < 3; i++) {
	  var entry = await Allowance.methods.tl(i).call();
	  (function (entries, i) {
	      const div = document.createElement("div");
	      div.id = "taskName";
	      const taskName = document.createTextNode(entry.message);
	      div.appendChild(taskName);
	      const claimant = document.createTextNode(entry.claimant);
	      const reward = document.createTextNode(entry.bounty_entry+ " Wei");
	      const confirmButton = document.createElement("button");
	      confirmButton.addEventListener("click", function() {confirmation(i)});
	      confirmButton.innerHTML = "Confirm";
	      const completeButton = document.createElement("button");
	      completeButton.addEventListener("click", function() {complete(i)});
	      completeButton.innerHTML = "Complete";
	      const rejectButton = document.createElement("button");
	      rejectButton.addEventListener("click", function() {reject(i);});
	      rejectButton.innerHTML = "Reject";
	      const br1 = document.createElement("br");
	      const br2 = document.createElement("br");
	      const br3 = document.createElement("br");
	      const p = document.createElement("p");
	      
	      p.classList.add("entry");
	      p.appendChild(div);
	      p.appendChild(br1);
	      p.appendChild(claimant);
	      p.appendChild(br2);
	      p.appendChild(reward);
	      p.appendChild(br3);
	      p.appendChild(completeButton);
	      p.appendChild(confirmButton);
	      p.appendChild(rejectButton);
	      
	      entriesNode.appendChild(p);
	  }(entry, i));
  }
}

//Allows a user to say a task is complete
async function complete(val) {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const taskName = document.getElementsByClassName("entry")[val].firstChild.innerText;

  const transactionParameters = {
          from: account,
          gasPrice: 0x1D91CA3600,
  };
  await Allowance.methods.complete(taskName).send(transactionParameters);
};

//Allows owner to confirm a completed task for payout
async function confirmation(val) {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const taskName = document.getElementsByClassName("entry")[val].firstChild.innerText;

  const transactionParameters = {
          from: account,
          gasPrice: 0x1D91CA3600,
  };
  await Allowance.methods.confirmation(taskName).send(transactionParameters);
};

//Allows owner to reject and reset a completed task
async function reject(val) {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const taskName = document.getElementsByClassName("entry")[val].firstChild.innerText;

  const transactionParameters = {
          from: account,
          gasPrice: 0x1D91CA3600,
  };
  await Allowance.methods.reject(taskName).send(transactionParameters);
};

/* Register a handler for when contract emits an Entry event after Guestbook is
 * signed to reload the page */
Allowance.events.Entry().on("data", function(event) {
  updateEntries();
});
