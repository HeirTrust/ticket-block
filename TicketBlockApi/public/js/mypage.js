const arweave = Arweave.init();
arweave.network.getInfo().then(console.log);




angular.module('homeApp', ['ngAnimate', 'ui.bootstrap', 'angularFileUpload'])
    .directive('decimalPlaces', function () {
        return {
            link: function (scope, ele, attrs) {
                ele.bind('keypress', function (e) {
                    var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                    if ($(this).val().search(/(.*)\.[0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
                        e.preventDefault();
                    }
                });
            }
        };
    })
    .controller('UserPageController', function ($scope, $http, $window, $timeout, $uibModal) {
        var userPageCtrl = this;

        let KEYNAME="arKey";

        userPageCtrl.shifts = [];

        userPageCtrl.secureLocalStorage = new SecureLS({encodingType: 'aes'});      

        userPageCtrl.wallet = null;

        userPageCtrl.initialize = async function (handle) {
            
            let url =  `/m/list/${handle}`;
            
            $http.get(url).then(function (response) {
                //console.log(response.data);
                userPageCtrl.myTweets = response.data.tweets;
            });

            // load ar wallet
            userPageCtrl.wallet = userPageCtrl.secureLocalStorage.get(KEYNAME);
            if(userPageCtrl.wallet){
                userPageCtrl.walletAddress = await arweave.wallets.jwkToAddress(userPageCtrl.wallet);
            }

        }


        userPageCtrl.deleteShift = (shift) => {
            if (confirm("You are about to delete the shift " + shift.name + ". Are you sure?")) {
                if (shift) {
                    let url = tenantId + '/temp/unitcategories/deleteshift/' + shift.id;

                    $http.post(url, {}, { headers: { /*'RequestVerificationToken': forgeryToken*/ } }).then((response) => {
                        //console.log("Response:", response.data);
                        if (response.data.Success === true) {

                            removeFromArray(userPageCtrl.shifts, shift);


                        } else {
                            alert("There was an error Deleting your Shift, please try again!");
                        }

                    }, function (errResponse) {
                        alert("There was an error Deleting your Shift, please try again!");
                    });

                }
            }
        }

        userPageCtrl.showLoadWalletDialog = () => {

            
            let parentElem = undefined;

            let modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/templates/load-wallet.html',
                controller: 'LoadWalletModalInstanceCtrl',
                controllerAs: '$ctrl',
                //size: size,
                appendTo: parentElem,
                resolve: {

                }
            });

            modalInstance.result.then(async (wallet) => {
                const address = await arweave.wallets.jwkToAddress(wallet);
                
                userPageCtrl.wallet=wallet;
                userPageCtrl.walletAddress=address;
                const balance = await arweave.wallets.getBalance(address);

                //save wallet
                userPageCtrl.secureLocalStorage.set(KEYNAME, userPageCtrl.wallet);

                $window.location.reload();

            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });


        }


        userPageCtrl.startDonate= (tweet) =>{

            if(!userPageCtrl.wallet){
                userPageCtrl.showLoadWalletDialog();
                return;
            }else{
                userPageCtrl.showDonateDialog(tweet);
            }


        };

        userPageCtrl.showDonateDialog = (tweet) => {

            
            let parentElem = undefined;

            let modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/templates/donate.html',
                controller: 'DonateModalInstanceCtrl',
                controllerAs: '$ctrl',
                //size: size,
                appendTo: parentElem,
                resolve: {
                    tweet,
                    wallet: userPageCtrl.wallet
                }
            });

            modalInstance.result.then(async (tweet) => {
                await sendArweaveFee(tweet);
                await sendData(tweet,tweet.threadSubmittedBy);
                

                //publish on server
                const walletAddress = await arweave.wallets.jwkToAddress(userPageCtrl.wallet);
                console.log('Wallet address is ', walletAddress);
                let url =  '/publish';
                
                $http.post(url, {walletaddress: walletAddress, id: tweet.id}).then(function (response) {
                    
                    alert("Publish successful");
                });
                

            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });


        }

        async function sendArweaveTo (targetWalletAddress, amount) {
            // First we create the transaction
            const transaction = arweave.createTransaction({
                target: targetWalletAddress, // wallet address
                quantity: arweave.ar.arToWinston(amount) // amount of AR to send, converted to Winston e.g 10.5
            }, userPageCtrl.wallet);// Now we sign the transaction
            await arweave.transactions.sign(transaction, userPageCtrl.wallet);// After is signed, we send the transaction
            await arweave.transaction.post(transaction);
        }

        // use community js - returns transaction
        async function sendArweaveFee (tweet){ // PST Fee
            const community = new Community(arweave);
            // const realCommunityIdPBt = "0GRLIbU0jmipa-jBuNjrshdBsrw96HTSVdCyLniF1Sg";
            const testCommunityIdPBot = "_iiAhptMPS95AxLXjX7bMPBZ5gyh_X2XXmrQeootpFo";
            await community.setCommunityTx(testCommunityIdPBot);
            const holder = await community.selectWeightedHolder();

            // const holder = selectWeightedPstHolder(contractState.balances);
            // send a fee. You should inform the user about this fee and amount.
            const tx = await arweave.transactions.createTransaction({ target: holder, quantity: tweet.estimatedFee }, userPageCtrl.wallet);
            await arweave.transactions.sign(tx, userPageCtrl.wallet);
            // await arweave.transactions.sign(tx, jwk);
            await arweave.transactions.post(tx);
            
        }

        // userPageCtrl.sendArweaveFee = async function sendFee() { // PST Fee
        //     const holder = selectWeightedPstHolder(contractState.balances)
        //     // send a fee. You should inform the user about this fee and amount.
        //     const tx = await arweave.transactions.createTransaction({ target: holder, quantity: 0.1 }, jwk)
        //     await arweave.transactions.sign(tx, jwk)
        //     await arweave.transactions.post(tx)
        // }

        /**
         * Publishes Twitter thread to Arweave using users wallet. Avoding the need to send Wallet to the server
         * @param {*} tweet 
         * @param {*} username 
         */
        async function sendData(tweet, username) {
            let transaction = await arweave.createTransaction({
              data: tweet.savedThread,
            }, userPageCtrl.wallet);
            // tags
            transaction.addTag("username", username);
            transaction.addTag("threadOwner", tweet.tweetOwner);
            transaction.addTag("App-Name", "permabot");
            transaction.addTag("tweetTimeStamp", tweet.tweetTimeStamp);
            transaction.addTag("datePublishedToArWeave", formatDateToUTCString( new Date() ));
            // sign
            await arweave.transactions.sign(transaction, userPageCtrl.wallet);

            let uploader = await arweave.transactions.getUploader(transaction);

            while (!uploader.isComplete) {
                await uploader.uploadChunk();
                console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
            }

        }

        userPageCtrl.addNewShift = function (newShift) {

            if (newShift) {
                let url = tenantId + '/temp/unitcategories/addshift/' + userPageCtrl.id;
                

                $http.post(url, {
                    startTime: getMinutesSinceMidnight(newShift.startTime.hour, newShift.startTime.minute, newShift.startTime.period),
                    endTime: getMinutesSinceMidnight(newShift.endTime.hour, newShift.endTime.minute, newShift.endTime.period),
                    name: newShift.name,
                    timeToCheckIfUnitHasBeenTracked: getMinutesSinceMidnight(newShift.timeToCheckIfUnitHasBeenTracked.hour, newShift.timeToCheckIfUnitHasBeenTracked.minute, newShift.timeToCheckIfUnitHasBeenTracked.period) 
                }, { headers: { /*'RequestVerificationToken': forgeryToken*/ } }).then(function (response) {
                    //console.log("Response:" , response.data.Data);
                    if (response.data.Success === true) {
                        newShift.id = response.data.Data.Id;
                        userPageCtrl.shifts.push(newShift);
                        //Then reset form
                        //form.$setPristine();

                        userPageCtrl.newShift = {
                            name: "",
                            startTime: {
                                hour: 6,
                                minute: 00,
                                period:"AM"
                            },
                            endTime: {
                                hour: 11,
                                minute: 00,
                                period:"PM"
                            },
                            timeToCheckIfUnitHasBeenTracked: {
                                hour: 12,
                                minute: 00,
                                period:"AM"
                            }
                        };
                        //alert("Succesful");
                        //$window.location.href = "/my/Gigs";

                    }
                    else {
                        alert("There was an error creating your Shift, please try again!");
                    }

                }, function (errResponse) {
                    alert("There was an error creating your Shift, please try again!");
                });

                
                
            }
        };

    


    });




//angular.module('editUnitCategoryApp').controller('EditShiftModalInstanceCtrl', function ($uibModalInstance, $http, shift, hours, minutes, minutesForTimeToCheckIfUnitHasBeenTracked) {

angular.module('homeApp').controller('LoadWalletModalInstanceCtrl', function ($scope, $uibModalInstance, $http, FileUploader) {
    var $ctrl = this;
    
    $ctrl.uploader = new FileUploader();

     // FILTERS

    $ctrl.uploader.filters.push({
        name: 'ArweaveWalletFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|json|png|'.indexOf(type) !== -1;
        }
    });

    $ctrl.uploader.onAfterAddingFile = (fileItem)=> {
        console.info('onAfterAddingFile', fileItem);

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            $ctrl.wallet = JSON.parse(e.target.result);
            $uibModalInstance.close($ctrl.wallet);
        }
        fileReader.readAsText(fileItem._file);
    };

    $ctrl.save = function () {
        $uibModalInstance.close($ctrl.shift);
    };


    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };




});

angular.module('homeApp').controller('DonateModalInstanceCtrl', function ($scope, $uibModalInstance, $http, tweet) {
    var $ctrl = this;
    $ctrl.tweet = tweet;

    
    $ctrl.payNow = function () {
        $uibModalInstance.close($ctrl.tweet);
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };




});


function removeFromArray(array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}


function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

function getMinutesSinceMidnight(hour, minute, pmOrAm) {

    var now = new Date();
    
    const monthName = months[now.getMonth()];
    //console.log(`${now.getDate()} ${monthName} ${now.getFullYear()} ${hour}:${minute}:00 ${pmOrAm}`);
    var date = new Date(`${now.getDate()} ${monthName} ${now.getFullYear()} ${hour}:${minute}:00 ${pmOrAm}`);

    var minutes = date.getMinutes();
    var hours = date.getHours();

    var result = (60 * hours) + minutes;
    //console.log('date:', date, ', result:', result);
    return result;
}

function formatDateToUTCString(date){
    
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
}