App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: async function() {
        // Check if MetaMask is available
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request MetaMask account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('MetaMask connected');
            } catch (error) {
                console.error("User denied account access to MetaMask");
            }
        } else if (window.web3) {
            // Legacy dapp browsers
            App.web3Provider = window.web3.currentProvider;
            console.log('Legacy web3 detected.');
        } else {
            // Fallback for non-dapp browsers
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            console.log('No MetaMask detected, using Ganache localhost.');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('voting.json', function(data) {
            // Create the contract object
            var votingArtifact = data;
            App.contracts.Voting = TruffleContract(votingArtifact);
            App.contracts.Voting.setProvider(App.web3Provider);

            // Display the current votes
            return App.displayVotes();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        // Bind the vote button clicks to the handleVote function
        $(document).on('click', '.btn-vote', App.handleVote);
    },

    displayVotes: function() {
        var votingInstance;

        // Get the deployed instance of the Voting contract
        App.contracts.Voting.deployed().then(function(instance) {
            votingInstance = instance;
            // Call the viewVotes function to get the current votes
            return votingInstance.viewVotes.call();
        }).then(function(votes) {
            // Display the votes for each candidate
            document.getElementById('v1').innerHTML = 'Candidate 1: ' + votes[0].toString();
            document.getElementById('v2').innerHTML = 'Candidate 2: ' + votes[1].toString();
            document.getElementById('v3').innerHTML = 'Candidate 3: ' + votes[2].toString();
        }).catch(function(err) {
            console.error('Error fetching votes:', err.message);
        });
    },

    handleVote: async function(event) {
        event.preventDefault();

        var candidateId = parseInt($(event.target).data('id'));

        try {
            // Get accounts from MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                throw new Error('No accounts found. Please connect to MetaMask.');
            }
            var account = accounts[0];
            console.log('Voting from account:', account);

            var votingInstance = await App.contracts.Voting.deployed();

            // Display a message to inform the user that the vote is being processed
            alert('Please confirm the vote in MetaMask.');

            // Cast the vote
            const result = await votingInstance.castVote(candidateId, { from: account, gas: 6000000 });

            console.log('Vote cast successfully!', result);

            // After vote is cast, update the UI
            alert('Your vote was cast successfully!');
            return App.displayVotes();

        } catch (err) {
            console.error('Error casting vote:', err.message);
            alert('Error casting vote. Please check the console for details.');
        }
    }
};

// Initialize the app when the window loads
$(function() {
    $(window).on('load', function() {
        App.init();
    });
});
