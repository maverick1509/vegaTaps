angular.module('reservations.controllers', ['ionic', 'ionic-timepicker', 'ionic-datepicker']) //'moment-picker'

    .config(function(ionicTimePickerProvider) {
        var timePickerObj = {
            inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
            format: 12,
            step: 15,
            setLabel: 'Set',
            closeLabel: 'Close'
        };
        ionicTimePickerProvider.configTimePicker(timePickerObj);
    })


    .config(function(ionicDatePickerProvider) {
        var datePickerObj = {
            inputDate: new Date(),
            titleLabel: 'Select a Date',
            setLabel: 'OK',
            todayLabel: 'Today',
            closeLabel: 'Cancel',
            mondayFirst: false,
            weeksList: ["S", "M", "T", "W", "T", "F", "S"],
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            showTodayButton: false,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: false,
            disableWeekdays: []
        };
        ionicDatePickerProvider.configDatePicker(datePickerObj);
    })


    .controller('EditReservationsCtrl', function(changeSlotService, $scope, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }



        //Default values
        $scope.mydata = changeSlotService.getValues();
        $scope.bookingDate = $scope.mydata.date;
        $scope.normalDate = $scope.mydata.date;

        if (isNaN($scope.mydata.id) || $scope.mydata.id == "") {
            $state.go('main.reservationsapp.upcoming');
        }

        //Date Picker stuff
        var ipObj2 = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;

                $scope.normalDate = date;
                $scope.bookingDate = fancyDate;

            },
            disabledDates: [ //Optional
            ],
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };


        $scope.changeDate = function() {
            ionicDatePicker.openDatePicker(ipObj2);
        }

        $scope.main = function() {
            $state.go('main.reservationsapp.upcoming');
        }

        $scope.chosenTime = $scope.mydata.time;
        $scope.mytime = {};
        $scope.mytime.time = "";



        $scope.editBook = function(resObj) {

            var temp_data = {};
            temp_data = resObj;
            temp_data.time = (moment($scope.mytime.time).format("HHmm"));
            temp_data.date = $scope.normalDate;

            if (temp_data.count == "" || temp_data.count == 0) {
                $scope.editReservationError = "Invalid Person Count";
            } else if (temp_data.date == "" || temp_data.time == "") {
                $scope.editReservationError = "Add Date and Time";
            } else {

                var data = {};
                data.token = window.localStorage.admin;
                data.details = temp_data;
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                $http({
                        method: 'POST',
                        url: 'https://kopperkadai.online/services/editreservationsadmin.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
						timeout : 10000
                    })
                    .success(function(response) {
						$ionicLoading.hide();
                        $state.go('main.reservationsapp.upcoming');
                    })
                    .error(function(data) {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });
                    });
            }
        }
    })


    .controller('NewReservationsCtrl', function(changeSlotService, $scope, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }

        //Default list of Channels
		$scope.channels = [{ name: "Direct Call", code: "DIRECT" }, { name: "Direct Email", code: "EMAIL" }];
		
		$scope.refreshModesList = function(){
                var data = {};
                data.token = window.localStorage.admin;
				
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner><br>Refreshing List'
                });
				
				
					$http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/deskreservationchannels.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
						timeout : 10000
                    })
                    .success(function(data) {
						$ionicLoading.hide();
						if(data.status){
							window.localStorage.modeList = JSON.stringify(data.response);
							$scope.channels = data.response;
							$scope.selectedChannelCode = $scope.channels[1].code;
						}
                    });					
		}
		
		if(_.isUndefined(window.localStorage.modeList) || window.localStorage.modeList == ''){
			$scope.refreshModesList();
		}
		else{
			$scope.channels = JSON.parse(window.localStorage.modeList);
		}
		        

        $scope.channel = '';
        $scope.selectedChannelCode = $scope.channels[1].code;

        $scope.setChannel = function(selectedChannel) {
			if(selectedChannel){
				$scope.selectedChannelCode = selectedChannel.code;
			}
        }

        $scope.ctrl = {};
        $scope.ctrl.timepicker = null;

        if (mappingService.getDate() == "") {
            $state.go('main.app.landing');
        }

        //Default values
        $scope.walkin = {};
        $scope.walkin.name = "";
        $scope.walkin.mobile = "";
        $scope.walkin.count = "";
        $scope.walkin.comments = "";

        $scope.bookingDate = mappingService.getFancyDate();

        $scope.walkin.bookingType = "walkin";

        $scope.setMode = function(mode) {
            $scope.walkin.bookingType = mode;
        }



        $scope.startTime = function() {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();

            if (m < 10) {
                m = "0" + m;
            }

            if (h < 10) {
                h = "0" + h;
            }
            $scope.railFormat = h + '' + m;
            return h + ':' + m;


        }


        $scope.chosenTime = $scope.startTime();

        /*
        	var ipObj1 = {
            callback: function (val) {      //Mandatory
              if (typeof (val) === 'undefined') {
              } else {
                var selectedTime = new Date(val * 1000);
                var h = selectedTime.getUTCHours();
                if (h<10) h = '0'+h;
                var m = selectedTime.getUTCMinutes();
                if (m<10) m = '0'+m;
                $scope.chosenTime = h+':'+m+':00';
              }
            },
            format: 24,         //Optional
            step: 1,           //Optional
            setLabel: 'OK',    //Optional
        		closeLabel: 'Cancel'
          };
        */

        $scope.changeTime = function() {
            //ionicTimePicker.openTimePicker(ipObj1);
            var onDateSelected = function(date) {
            }
        }

        $scope.changeTime();

        //Date Picker stuff
        var ipObj2 = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;
                mappingService.setDate(date, fancyDate);
                $scope.bookingDate = fancyDate;

            },
            disabledDates: [ //Optional
            ],
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };


        $scope.changeDate = function() {
            ionicDatePicker.openDatePicker(ipObj2);
        }


        $scope.main = function() {
            $state.go('main.reservationsapp.upcoming');
        }

        $scope.mytime = {};
        $scope.mytime.slot = $scope.chosenTime;


        $scope.addBook = function(walkin) {
            $scope.walkin.time = (moment($scope.mytime.slot).format("HHmm"));
            if ($scope.walkin.time == 'Invalid date') {
                $scope.walkin.time = $scope.railFormat;
            }

            $scope.walkin.date = mappingService.getDate();
            if ($scope.walkin.bookingType == 'walkin') {
                $scope.walkin.mode = 'WALKIN';
            } else {
                $scope.walkin.mode = $scope.selectedChannelCode;
            }

            if ($scope.walkin.name == "") {
                        $ionicLoading.show({
                            template: "Add Name",
                            duration: 2000
                        });
						
            } else if ($scope.walkin.mobile == "") {
                        $ionicLoading.show({
                            template: "Add Mobile Number",
                            duration: 2000
                        });
						
            } else if ($scope.walkin.count == "") {
                        $ionicLoading.show({
                            template: "Add Number of Guests",
                            duration: 2000
                        });				
            } else {
                var data = {};
                data.token = window.localStorage.admin;
                data.details = $scope.walkin;

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/newreservationsadmin.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
						timeout : 10000
                    })
                    .success(function(response) {
						$ionicLoading.hide();
                        $state.go('main.reservationsapp.upcoming');
                    })
                    .error(function(data) {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });
                    });
            }


        }


    })


.controller('completedReservationsCtrl', function(changeSlotService, currentFilterService, $ionicSideMenuDelegate, $ionicLoading, ionicDatePicker, $scope, $interval, $ionicPopup, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }

        $scope.myDate = mappingService.getFancyDate();
        $scope.myActualDate = mappingService.getDate();

        if ($scope.myDate == "") {
            $state.go('main.app.landing');
        }


        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


    $scope.searchKey = {};
    $scope.searchKey.value = '';

    $scope.resetSearchKey = function(){
        $scope.searchKey.value = '';
    }




    //Filter Options
    $scope.getTodayDefaultDate = function(){
                var temp = new Date();
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;

                return date;
    }

    $scope.recallFilterMemory = function(){
        $scope.isFilterEnabled = currentFilterService.getFilterFlag();

        if($scope.isFilterEnabled){
            $scope.filterFrom = currentFilterService.getDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = currentFilterService.getFancyDate();
        }
        else{
            $scope.filterFrom = $scope.getTodayDefaultDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = $scope.filterFrom;
        }

        $scope.filterPendingApply = false;
    }

    $scope.recallFilterMemory();


    $scope.triggerFilter = function(){
        //show date selection window
        $scope.changeFilterFrom();
    }

    $scope.clearDateFilter = function(){
        $scope.isFilterEnabled = false;
        $scope.filterFrom = $scope.getTodayDefaultDate();
        $scope.filterFromBackup = $scope.filterFrom;
        $scope.filterFancyDate = $scope.filterFrom;

        currentFilterService.setFilterFlag(false);
        currentFilterService.setDate($scope.filterFrom);
        currentFilterService.setFancyDate($scope.filterFancyDate);

        $scope.fetchData();
    }   


        //Date Picker stuff
        var filterFromDate = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;

                $scope.filterFromBackup = $scope.filterFrom;
                $scope.filterFrom = date;
                
                $scope.filterFancyDateBackup = $scope.filterFancyDate;
                $scope.filterFancyDate = fancyDate;

                $scope.isFilterEnabled = true;

                currentFilterService.setFilterFlag(true);
                currentFilterService.setDate(date);
                currentFilterService.setFancyDate(fancyDate);

                $scope.fetchData();
            },
            disabledDates: [ //Optional
            ],
            //from: new Date(), //Optional
            to: new Date(), //Optional
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };

        $scope.changeFilterFrom = function() {
            ionicDatePicker.openDatePicker(filterFromDate);
        }


  //Fetch Data

  //Number of Sessions by Default = 0
      $scope.numberOfSessions = 0;
      $scope.sessionSummary = [];

      $scope.fetchData = function(){

            $scope.isRenderLoaded = false;
            $scope.renderFailed = false;

            var data = {};
            data.token = window.localStorage.admin;

            if($scope.isFilterEnabled){
                data.date = $scope.filterFrom;
            }

            //LOADING 
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

            $http({
              method  : 'POST',
              url     : 'https://zaitoon.online/services/deskfetchreservations.php',
              data    : data,
              headers : {'Content-Type': 'application/x-www-form-urlencoded'},
              timeout : 10000
             })
             .success(function(response) {
                $ionicLoading.hide();
                if(response.status){
                        $scope.isReservationsFound = true;
                        $scope.reservationsList = response.response;

                        $scope.reservationsList_length = $scope.reservationsList.length;

                        $scope.sessionSummary = response.sessionSummary;
                        $scope.numberOfSessions = $scope.sessionSummary.length;

                        $scope.renderInfo();
                        $scope.renderFailed = false;
                }
                else{
                        $scope.isReservationsFound = false;
                        $scope.resultMessage = "There are no Reservations found";
                        $scope.reservationsList_length = 0;

                        $scope.sessionSummary = [];
                        $scope.numberOfSessions = 0;
                        
                        $scope.renderFailed = true;

                        $ionicLoading.show({
                            template:  response.error,
                            duration: 3000
                        });                    
                }

                $scope.$broadcast('scroll.refreshComplete');
                $scope.applyFilterOnResultData(); //Apply filter on the data
            })
           .error(function(data){
            $ionicLoading.hide();
              $ionicLoading.show({
                template:  "Not responding. Check your connection.",
                duration: 3000
              });

              $scope.renderFailed = true;
              $scope.$broadcast('scroll.refreshComplete');

          });
              
      }

      $scope.fetchData();

      $scope.doRefresh = function(){
        $scope.fetchData();
      }

      $scope.isRenderLoaded = false;

      $scope.renderInfo = function(){

                $scope.isRenderLoaded = true;
                //Nothing to render!!
      }

      /*
        DISPLAY RESULT FILTERATION
      */

      //Apply filter on RESULT
      $scope.reservationsFilteredList = [];
      $scope.applyFilterOnResultData = function(){
        $scope.reservationsFilteredList = [];
        var n = 0;
        while($scope.reservationsList[n]){
            if($scope.reservationsList[n].statusCode == 2) //only if status = 2 (completed reservation)
            {
               if ($scope.timeFilterFlag == 'All') { //Show all, no restrictions
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
                else if($scope.timeFilterFlag == $scope.reservationsList[n].session){
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
            }

            n++;
        }

      }


        $scope.timeFilterFlag = currentFilterService.getSession(); //default from service memory

        if (window.localStorage.timeFilter && window.localStorage.timeFilter != '') {
            $scope.timeFilterFlag = window.localStorage.timeFilter;

            currentFilterService.setSession($scope.timeFilterFlag);
        }

        $scope.changeTimeFilter = function() {

            if($scope.numberOfSessions == 0){
                return '';
            }

            //Showing All --> first in the session list
            if($scope.timeFilterFlag == 'All'){
                $scope.timeFilterFlag = $scope.sessionSummary[0].sessionName;
                window.localStorage.timeFilter = $scope.timeFilterFlag;
                currentFilterService.setSession($scope.timeFilterFlag);
                $scope.applyFilterOnResultData();//apply new filter on display data
                return '';
            }

            //Showing something in the sessions list --> next in the sessions list
            for(var i = 0; i < $scope.numberOfSessions; i++){
                if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName && i != $scope.numberOfSessions - 1){
                    $scope.timeFilterFlag = $scope.sessionSummary[i+1].sessionName;
                    break;
                }
            }

            //last iteration, set to ALL
            if(i == $scope.numberOfSessions){
                $scope.timeFilterFlag = 'All';
            }

            window.localStorage.timeFilter = $scope.timeFilterFlag;
            currentFilterService.setSession($scope.timeFilterFlag);
            $scope.applyFilterOnResultData();//apply new filter on display data
        }




        //Time Filter not found warning
        $scope.displayWarningCheck = function() {

            if($scope.numberOfSessions == 0){
                return -1;
            }

            if($scope.timeFilterFlag == 'All'){ //Show all

                var activeCountSum = 0;
                var doneCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    activeCountSum += $scope.sessionSummary[i].activeCount;
                    doneCountSum += $scope.sessionSummary[i].doneCount;
                }

                if(activeCountSum == 0 && doneCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeCountSum == 0 && doneCountSum != 0){
                    return 1; //No active, all moved to History
                }
            }
            else{ //Show session wise

                var activeSessionCountSum = 0;
                var doneSessionCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName){
                        activeSessionCountSum = $scope.sessionSummary[i].activeCount;
                        doneSessionCountSum = $scope.sessionSummary[i].doneCount;
                        break;
                    }
                }
                
                if(activeSessionCountSum == 0 && doneSessionCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeSessionCountSum == 0 && doneSessionCountSum != 0){
                    return 1; //No active, all moved to History
                }

            }

            return -1;
        }

        $scope.quickSummary = function() {

            var myTemplate = '';

            var activeCount = 0;
            var activePAX = 0;

            var doneCount = 0;
            var donePAX = 0;

            for(var i = 0; i < $scope.numberOfSessions; i++){

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">'+$scope.sessionSummary[i].sessionName+' Session</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Pending</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activeCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activePAX + '</div></div>'; // <--- Lunch Pending

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].doneCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].donePAX + '</div></div>'; // <--- Lunch Done

                doneCount += $scope.sessionSummary[i].doneCount;
                donePAX += $scope.sessionSummary[i].donePAX;

            }


            /* All */
            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">All Sessions</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + doneCount + '</div><div class="col col-25" style="text-align: center">' + donePAX + '</div></div>'; // <--- All Done


            $ionicPopup.alert({
                title: 'Quick Summary',
                template: myTemplate,
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-balanced button-outline'
                }]
            });
        }



        $scope.openOptions = function(reservation) {

            var myPopup = "";

            if (reservation.statusCode == 0) {
                myPopup = $ionicPopup.show({
                    title: 'Options',
                    template: '<button class="button icon-left ion-android-checkbox-outline button-balanced button-block" ng-click="initAssignTable(\''+encodeURI(JSON.stringify(reservation))+'\')">Allot Seat</button>' +
                        '<button class="button icon-left ion-edit button-outline button-positive button-block" ng-click="initModifyReservation()">Edit Reservation</button>'+
                        '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Cancel Reservation</button>' +
                        '<button class="button icon-left ion-trash-a button-outline button-assertive button-block" ng-click="initDeleteReservation()">Mark Spam and Delete</button>',
                    scope: $scope,
                    buttons: [{
                        text: 'Close'
                    }]
                });

            } else if (reservation.statusCode == 1) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 2) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 4) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
            } else if (reservation.statusCode == 5 || reservation.statusCode == 6) {
                $ionicLoading.show({
                    template: "This reservation is <b style='color: #e74c3c'>Cancelled</b>",
                    duration: 2000
                });
            } else {
                $ionicLoading.show({
                    template: "This reservation can not be edited",
                    duration: 2000
                });
            }


            $scope.assignTableNow = function(reservation){

                if(reservation.statusCode != 0 || reservation.statusCode != 1){
                    $ionicLoading.show({
                        template: "This reservation is already <b style='color: #2ecc71'>Completed</b>",
                        duration: 2000
                    });
                }
                else{
                        currentBooking.setBooking(reservation);
                        $state.go('main.reservationsapp.map');
                }
            }

            //Initialisers
            $scope.initAssignTable = function(encodedReservation) {
                myPopup.close();
                var reservation = JSON.parse(decodeURI(encodedReservation));
                $scope.assignTableNow(reservation);
            }

            $scope.initCancelReservation = function() {
                myPopup.close();
                $scope.cancelReservation(reservation);
            }

            $scope.initDeleteReservation = function() {
                myPopup.close();
                $scope.deleteReservation(reservation);
            }

            $scope.initModifyReservation = function() {
                myPopup.close();
                $scope.modifyReservation(reservation);
            }

            $scope.initCompleteReservation = function() {
                myPopup.close();
                $scope.completeReservation(reservation);
            }

        }

        $scope.quickView = function(reservation) {

            $ionicPopup.alert({
                title: 'Comments',
                template: '<p style="margin: 0; text-align: center; font-size: 16px; font-weight: 400; color: #2980b9;">' + reservation.comments + '</p>',
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-stable button-outline'
                }]
            });
        }


        //For Gen View only
        $scope.openSeatPlanView = function() {
            currentBooking.setBooking('');
            $state.go('main.reservationsapp.map');
        }


        $scope.getClass = function(code, status) {

            if (code == 'COUNT') {
                if (status == 0) {
                    return 'resReceivedCount';
                } else if (status == 1) {
                    return 'resSeatedCount';
                } else if (status == 2) {
                    return 'resFinishedCount';

                } else if (status == 4) {
                    return 'resBilledCount';

                } else if (status == 5) {

                    return 'resCancelledCount';
                }
            } else if (code == 'STATUS') {
                if (status == 0) {
                    return 'resReceived';
                } else if (status == 1) {
                    return 'resSeated';
                } else if (status == 2) {
                    return 'resFinished';
                } else if (status == 4) {
                    return 'resBilled';

                } else if (status == 5) {

                    return 'resCancelled';
                }
            }


        }


        $scope.getShortBrief = function(resObj) {
            if (resObj.statusCode == 0) {
                return resObj.time;
            } else if (resObj.statusCode == 1) {
                return resObj.timeLapse != '' ? resObj.timeLapse : resObj.time;
            } else if (resObj.statusCode == 2) {
                return 'Completed';
            } else if (resObj.statusCode == 4) {
                return 'Billing';
            } else if (resObj.statusCode == 5) {
                return 'Cancelled';
            }

        }


        $scope.Timer = $interval(function() {
            $scope.fetchData();
        }, 60000);
        
        $scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});




        $scope.newBook = function() {
            $state.go('main.app.walkin');
        }

        $scope.modifyReservation = function(reservation) {
            changeSlotService.setValues(reservation);
            $state.go('main.app.change');
        }

        $scope.completeReservation = function(reservation) {

            $ionicPopup.show({
                title: 'The tables allocated to <strong style="color: #e74c3c">' + reservation.user + '</strong> will automatically get released when you mark it \'Completed\'. Do you really want to mark this reservation as \'Completed\'?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Complete</b>',
                        type: 'button-balanced',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskmarkreservationcompleted.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Marked Completed and tables released',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }


        $scope.cancelReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Do you really want to Cancel this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Yes, Cancel</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/cancelreservationsadmin.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Cancelled',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }

        $scope.deleteReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Deleting a Reservation will delete it for ever. It can not be undone. Do you really want to delete this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'Cancel',
                        onTap: function(e) {
                            return true;
                        }
                    },
                    {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;

                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskdeletereservation.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Deleted',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });

        }

        $scope.goHome = function() {
            $state.go('main.app.landing');
        }

    })

 
.controller('seatedReservationsCtrl', function(changeSlotService, currentFilterService, $ionicSideMenuDelegate, $ionicLoading, ionicDatePicker, $scope, $interval, $ionicPopup, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }

        $scope.myDate = mappingService.getFancyDate();
        $scope.myActualDate = mappingService.getDate();

        if ($scope.myDate == "") {
            $state.go('main.app.landing');
        }


        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


    $scope.searchKey = {};
    $scope.searchKey.value = '';

    $scope.resetSearchKey = function(){
        $scope.searchKey.value = '';
    }




    //Filter Options
    $scope.getTodayDefaultDate = function(){
                var temp = new Date();
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;

                return date;
    }

    $scope.recallFilterMemory = function(){
        $scope.isFilterEnabled = currentFilterService.getFilterFlag();

        if($scope.isFilterEnabled){
            $scope.filterFrom = currentFilterService.getDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = currentFilterService.getFancyDate();
        }
        else{
            $scope.filterFrom = $scope.getTodayDefaultDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = $scope.filterFrom;
        }

        $scope.filterPendingApply = false;
    }

    $scope.recallFilterMemory();


    $scope.triggerFilter = function(){
        //show date selection window
        $scope.changeFilterFrom();
    }

    $scope.clearDateFilter = function(){
        $scope.isFilterEnabled = false;
        $scope.filterFrom = $scope.getTodayDefaultDate();
        $scope.filterFromBackup = $scope.filterFrom;
        $scope.filterFancyDate = $scope.filterFrom;

        currentFilterService.setFilterFlag(false);
        currentFilterService.setDate($scope.filterFrom);
        currentFilterService.setFancyDate($scope.filterFancyDate);

        $scope.fetchData();
    }   


        //Date Picker stuff
        var filterFromDate = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;

                $scope.filterFromBackup = $scope.filterFrom;
                $scope.filterFrom = date;
                
                $scope.filterFancyDateBackup = $scope.filterFancyDate;
                $scope.filterFancyDate = fancyDate;

                $scope.isFilterEnabled = true;

                currentFilterService.setFilterFlag(true);
                currentFilterService.setDate(date);
                currentFilterService.setFancyDate(fancyDate);

                $scope.fetchData();
            },
            disabledDates: [ //Optional
            ],
            //from: new Date(), //Optional
            to: new Date(), //Optional
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };

        $scope.changeFilterFrom = function() {
            ionicDatePicker.openDatePicker(filterFromDate);
        }


    //Fetch Data

    //Number of Sessions by Default = 0
      $scope.numberOfSessions = 0;
      $scope.sessionSummary = [];

      $scope.fetchData = function(){

            $scope.isRenderLoaded = false;
            $scope.renderFailed = false;

            var data = {};
            data.token = window.localStorage.admin;

            if($scope.isFilterEnabled){
                data.date = $scope.filterFrom;
            }

            //LOADING 
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

            $http({
              method  : 'POST',
              url     : 'https://zaitoon.online/services/deskfetchreservations.php',
              data    : data,
              headers : {'Content-Type': 'application/x-www-form-urlencoded'},
              timeout : 10000
             })
             .success(function(response) {
                $ionicLoading.hide();
                if(response.status){
                        $scope.isReservationsFound = true;
                        $scope.reservationsList = response.response;

                        $scope.reservationsList_length = $scope.reservationsList.length;

                        $scope.sessionSummary = response.sessionSummary;
                        $scope.numberOfSessions = $scope.sessionSummary.length;

                        $scope.renderInfo();
                        $scope.renderFailed = false;
                }
                else{
                        $scope.isReservationsFound = false;
                        $scope.resultMessage = "There are no Reservations found";
                        $scope.reservationsList_length = 0;

                        $scope.sessionSummary = [];
                        $scope.numberOfSessions = 0;
                        
                        $scope.renderFailed = true;

                        $ionicLoading.show({
                            template:  response.error,
                            duration: 3000
                        });                    
                }

                $scope.$broadcast('scroll.refreshComplete');
                $scope.applyFilterOnResultData(); //Apply filter on the data
            })
           .error(function(data){
            $ionicLoading.hide();
              $ionicLoading.show({
                template:  "Not responding. Check your connection.",
                duration: 3000
              });

              $scope.renderFailed = true;
              $scope.$broadcast('scroll.refreshComplete');

          });
              
      }

      $scope.fetchData();

      $scope.doRefresh = function(){
        $scope.fetchData();
      }

      $scope.isRenderLoaded = false;

      $scope.renderInfo = function(){

                $scope.isRenderLoaded = true;
                //Nothing to render!!
      }

      /*
        DISPLAY RESULT FILTERATION
      */

      //Apply filter on RESULT
      $scope.reservationsFilteredList = [];
      $scope.applyFilterOnResultData = function(){
        $scope.reservationsFilteredList = [];
        var n = 0;
        while($scope.reservationsList[n]){
            if($scope.reservationsList[n].statusCode == 1) //only if status = 1 (seated reservation)
            {
               if ($scope.timeFilterFlag == 'All') { //Show all, no restrictions
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
                else if($scope.timeFilterFlag == $scope.reservationsList[n].session){
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
            }

            n++;
        }

      }


        $scope.timeFilterFlag = currentFilterService.getSession(); //default from service memory

        if (window.localStorage.timeFilter && window.localStorage.timeFilter != '') {
            $scope.timeFilterFlag = window.localStorage.timeFilter;

            currentFilterService.setSession($scope.timeFilterFlag);
        }

        $scope.changeTimeFilter = function() {

            if($scope.numberOfSessions == 0){
                return '';
            }

            //Showing All --> first in the session list
            if($scope.timeFilterFlag == 'All'){
                $scope.timeFilterFlag = $scope.sessionSummary[0].sessionName;
                window.localStorage.timeFilter = $scope.timeFilterFlag;
                currentFilterService.setSession($scope.timeFilterFlag);
                $scope.applyFilterOnResultData();//apply new filter on display data
                return '';
            }

            //Showing something in the sessions list --> next in the sessions list
            for(var i = 0; i < $scope.numberOfSessions; i++){
                if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName && i != $scope.numberOfSessions - 1){
                    $scope.timeFilterFlag = $scope.sessionSummary[i+1].sessionName;
                    break;
                }
            }

            //last iteration, set to ALL
            if(i == $scope.numberOfSessions){
                $scope.timeFilterFlag = 'All';
            }

            window.localStorage.timeFilter = $scope.timeFilterFlag;
            currentFilterService.setSession($scope.timeFilterFlag);
            $scope.applyFilterOnResultData();//apply new filter on display data
        }




        //Time Filter not found warning
        $scope.displayWarningCheck = function() {

            if($scope.numberOfSessions == 0){
                return -1;
            }

            if($scope.timeFilterFlag == 'All'){ //Show all

                var activeCountSum = 0;
                var doneCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    activeCountSum += $scope.sessionSummary[i].activeCount;
                    doneCountSum += $scope.sessionSummary[i].doneCount;
                }

                if(activeCountSum == 0 && doneCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeCountSum == 0 && doneCountSum != 0){
                    return 1; //No active, all moved to History
                }
            }
            else{ //Show session wise

                var activeSessionCountSum = 0;
                var doneSessionCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName){
                        activeSessionCountSum = $scope.sessionSummary[i].activeCount;
                        doneSessionCountSum = $scope.sessionSummary[i].doneCount;
                        break;
                    }
                }
                
                if(activeSessionCountSum == 0 && doneSessionCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeSessionCountSum == 0 && doneSessionCountSum != 0){
                    return 1; //No active, all moved to History
                }

            }

            return -1;
        }

        $scope.quickSummary = function() {

            var myTemplate = '';

            var activeCount = 0;
            var activePAX = 0;

            var doneCount = 0;
            var donePAX = 0;

            for(var i = 0; i < $scope.numberOfSessions; i++){

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">'+$scope.sessionSummary[i].sessionName+' Session</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Pending</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activeCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activePAX + '</div></div>'; // <--- Lunch Pending

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].doneCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].donePAX + '</div></div>'; // <--- Lunch Done

                doneCount += $scope.sessionSummary[i].doneCount;
                donePAX += $scope.sessionSummary[i].donePAX;

            }


            /* All */
            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">All Sessions</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + doneCount + '</div><div class="col col-25" style="text-align: center">' + donePAX + '</div></div>'; // <--- All Done


            $ionicPopup.alert({
                title: 'Quick Summary',
                template: myTemplate,
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-balanced button-outline'
                }]
            });
        }



        $scope.openOptions = function(reservation) {

            var myPopup = "";

            if (reservation.statusCode == 0) {
                myPopup = $ionicPopup.show({
                    title: 'Options',
                    template: '<button class="button icon-left ion-android-checkbox-outline button-balanced button-block" ng-click="initAssignTable(\''+encodeURI(JSON.stringify(reservation))+'\')">Allot Seat</button>' +
                        '<button class="button icon-left ion-edit button-outline button-positive button-block" ng-click="initModifyReservation()">Edit Reservation</button>'+
                        '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Cancel Reservation</button>' +
                        '<button class="button icon-left ion-trash-a button-outline button-assertive button-block" ng-click="initDeleteReservation()">Mark Spam and Delete</button>',
                    scope: $scope,
                    buttons: [{
                        text: 'Close'
                    }]
                });

            } else if (reservation.statusCode == 1) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 2) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 4) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
            } else if (reservation.statusCode == 5 || reservation.statusCode == 6) {
                $ionicLoading.show({
                    template: "This reservation is <b style='color: #e74c3c'>Cancelled</b>",
                    duration: 2000
                });
            } else {
                $ionicLoading.show({
                    template: "This reservation can not be edited",
                    duration: 2000
                });
            }


            $scope.assignTableNow = function(reservation){

                var reservation = JSON.parse(decodeURI(encodedReservation));

                if(reservation.statusCode != 0 || reservation.statusCode != 1){
                    $ionicLoading.show({
                        template: "This reservation is already <b style='color: #2ecc71'>Completed</b>",
                        duration: 2000
                    });
                }
                else{
                        currentBooking.setBooking(reservation);
                        $state.go('main.reservationsapp.map');
                }
            }
            //Initialisers
            $scope.initAssignTable = function(encodedReservation) {
                myPopup.close();
                var reservation = JSON.parse(decodeURI(encodedReservation));
                $scope.assignTableNow(reservation);
            }

            $scope.initCancelReservation = function() {
                myPopup.close();
                $scope.cancelReservation(reservation);
            }

            $scope.initDeleteReservation = function() {
                myPopup.close();
                $scope.deleteReservation(reservation);
            }

            $scope.initModifyReservation = function() {
                myPopup.close();
                $scope.modifyReservation(reservation);
            }

            $scope.initCompleteReservation = function() {
                myPopup.close();
                $scope.completeReservation(reservation);
            }

        }

        $scope.quickView = function(reservation) {

            $ionicPopup.alert({
                title: 'Comments',
                template: '<p style="margin: 0; text-align: center; font-size: 16px; font-weight: 400; color: #2980b9;">' + reservation.comments + '</p>',
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-stable button-outline'
                }]
            });
        }


        //For Gen View only
        $scope.openSeatPlanView = function() {
            currentBooking.setBooking('');
            $state.go('main.reservationsapp.map');
        }



        $scope.getShortBrief = function(resObj) {
            if (resObj.statusCode == 0) {
                return resObj.time;
            } else if (resObj.statusCode == 1) {
                return resObj.timeLapse != '' ? resObj.timeLapse : resObj.time;
            } else if (resObj.statusCode == 2) {
                return 'Completed';
            } else if (resObj.statusCode == 4) {
                return 'Billing';
            } else if (resObj.statusCode == 5) {
                return 'Cancelled';
            }

        }


        $scope.Timer = $interval(function() {
            $scope.fetchData();
        }, 60000);
        
        $scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});




        $scope.newBook = function() {
            $state.go('main.app.walkin');
        }

        $scope.modifyReservation = function(reservation) {
            changeSlotService.setValues(reservation);
            $state.go('main.app.change');
        }

        $scope.completeReservation = function(reservation) {

            $ionicPopup.show({
                title: 'The tables allocated to <strong style="color: #e74c3c">' + reservation.user + '</strong> will automatically get released when you mark it \'Completed\'. Do you really want to mark this reservation as \'Completed\'?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Complete</b>',
                        type: 'button-balanced',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskmarkreservationcompleted.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Marked Completed and tables released',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }


        $scope.cancelReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Do you really want to Cancel this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Yes, Cancel</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/cancelreservationsadmin.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Cancelled',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }

        $scope.deleteReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Deleting a Reservation will delete it for ever. It can not be undone. Do you really want to delete this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'Cancel',
                        onTap: function(e) {
                            return true;
                        }
                    },
                    {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;

                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskdeletereservation.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout : 10000
                                })
                                .success(function(response) {
                                    $ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Deleted',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });

        }

        $scope.goHome = function() {
            $state.go('main.app.landing');
        }

    })

.controller('upcomingReservationsCtrl', function(changeSlotService, currentFilterService, $ionicSideMenuDelegate, $ionicLoading, ionicDatePicker, $scope, $interval, $ionicPopup, $state, $http, $ionicPopover, $ionicLoading, $timeout, mappingService, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }

        $scope.myDate = mappingService.getFancyDate();
        $scope.myActualDate = mappingService.getDate();

        if ($scope.myDate == "") {
            $state.go('main.app.landing');
        }


        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };


    $scope.searchKey = {};
    $scope.searchKey.value = '';

    $scope.resetSearchKey = function(){
        $scope.searchKey.value = '';
    }




    //Filter Options
    $scope.getTodayDefaultDate = function(){
                var temp = new Date();
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;

                return date;
    }

    $scope.recallFilterMemory = function(){
        $scope.isFilterEnabled = currentFilterService.getFilterFlag();

        if($scope.isFilterEnabled){
            $scope.filterFrom = currentFilterService.getDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = currentFilterService.getFancyDate();
        }
        else{
            $scope.filterFrom = $scope.getTodayDefaultDate();
            $scope.filterFromBackup = $scope.filterFrom;
            $scope.filterFancyDate = $scope.filterFrom;
        }

        $scope.filterPendingApply = false;
    }

    $scope.recallFilterMemory();


    $scope.triggerFilter = function(){
        //show date selection window
        $scope.changeFilterFrom();
    }

    $scope.clearDateFilter = function(){
        $scope.isFilterEnabled = false;
        $scope.filterFrom = $scope.getTodayDefaultDate();
        $scope.filterFromBackup = $scope.filterFrom;
        $scope.filterFancyDate = $scope.filterFrom;

        currentFilterService.setFilterFlag(false);
        currentFilterService.setDate($scope.filterFrom);
        currentFilterService.setFancyDate($scope.filterFancyDate);

        $scope.fetchData();
    }   


        //Date Picker stuff
        var filterFromDate = {
            callback: function(val) { //Mandatory

                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var temp = new Date(val);
                var mm = temp.getMonth() + 1;
                var dd = temp.getDate();
                var yyyy = temp.getFullYear();
                if (mm < 10) mm = '0' + mm;
                if (dd < 10) dd = '0' + dd;
                var date = dd + '-' + mm + '-' + yyyy;
                var fancyDate = dd + ' ' + monthNames[temp.getMonth()] + ', ' + yyyy;

                $scope.filterFromBackup = $scope.filterFrom;
                $scope.filterFrom = date;
                
                $scope.filterFancyDateBackup = $scope.filterFancyDate;
                $scope.filterFancyDate = fancyDate;

                $scope.isFilterEnabled = true;

                currentFilterService.setFilterFlag(true);
                currentFilterService.setDate(date);
                currentFilterService.setFancyDate(fancyDate);

                $scope.fetchData();
            },
            disabledDates: [ //Optional
            ],
            //from: new Date(), //Optional
            to: new Date(), //Optional
            inputDate: new Date(), //Optional
            mondayFirst: true, //Optional
            disableWeekdays: [], //Optional
            closeOnSelect: false, //Optional
            templateType: 'popup' //Optional
        };

        $scope.changeFilterFrom = function() {
            ionicDatePicker.openDatePicker(filterFromDate);
        }


    //Fetch Data

    //Number of Sessions by Default = 0
      $scope.numberOfSessions = 0;
      $scope.sessionSummary = [];

      $scope.fetchData = function(){

            $scope.isRenderLoaded = false;
            $scope.renderFailed = false;

            var data = {};
            data.token = window.localStorage.admin;

            if($scope.isFilterEnabled){
                data.date = $scope.filterFrom;
            }

            //LOADING 
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

            $http({
              method  : 'POST',
              url     : 'https://zaitoon.online/services/deskfetchreservations.php',
              data    : data,
              headers : {'Content-Type': 'application/x-www-form-urlencoded'},
              timeout : 10000
             })
             .success(function(response) {
                $ionicLoading.hide();
                if(response.status){
                        $scope.isReservationsFound = true;
                        $scope.reservationsList = response.response;

                        $scope.reservationsList_length = $scope.reservationsList.length;

                        $scope.sessionSummary = response.sessionSummary;
                        $scope.numberOfSessions = $scope.sessionSummary.length;

                        $scope.renderInfo();
                        $scope.renderFailed = false;
                }
                else{
                        $scope.isReservationsFound = false;
                        $scope.resultMessage = "There are no Reservations found";
                        $scope.reservationsList_length = 0;

                        $scope.sessionSummary = [];
                        $scope.numberOfSessions = 0;
                        
                        $scope.renderFailed = true;

                        $ionicLoading.show({
                            template:  response.error,
                            duration: 3000
                        });                    
                }

                $scope.$broadcast('scroll.refreshComplete');
                $scope.applyFilterOnResultData(); //Apply filter on the data
            })
           .error(function(data){
            $ionicLoading.hide();
              $ionicLoading.show({
                template:  "Not responding. Check your connection.",
                duration: 3000
              });

              $scope.renderFailed = true;
              $scope.$broadcast('scroll.refreshComplete');

          });
              
      }

      $scope.fetchData();

      $scope.doRefresh = function(){
        $scope.fetchData();
      }

      $scope.isRenderLoaded = false;

      $scope.renderInfo = function(){

                $scope.isRenderLoaded = true;
                //Nothing to render!!
      }

      /*
        DISPLAY RESULT FILTERATION
      */

      //Apply filter on RESULT
      $scope.reservationsFilteredList = [];
      $scope.applyFilterOnResultData = function(){
        $scope.reservationsFilteredList = [];
        var n = 0;
        while($scope.reservationsList[n]){
            if($scope.reservationsList[n].statusCode == 0) //only if status = 0 (upcoming reservation)
            {
               if ($scope.timeFilterFlag == 'All') { //Show all, no restrictions
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
                else if($scope.timeFilterFlag == $scope.reservationsList[n].session){
                    $scope.reservationsFilteredList.push($scope.reservationsList[n]);
                }
            }

            n++;
        }

      }


        $scope.timeFilterFlag = currentFilterService.getSession(); //default from service memory

        if (window.localStorage.timeFilter && window.localStorage.timeFilter != '') {
            $scope.timeFilterFlag = window.localStorage.timeFilter;

            currentFilterService.setSession($scope.timeFilterFlag);
        }

        $scope.changeTimeFilter = function() {

            if($scope.numberOfSessions == 0){
                return '';
            }

            //Showing All --> first in the session list
            if($scope.timeFilterFlag == 'All'){
                $scope.timeFilterFlag = $scope.sessionSummary[0].sessionName;
                window.localStorage.timeFilter = $scope.timeFilterFlag;
                currentFilterService.setSession($scope.timeFilterFlag);
                $scope.applyFilterOnResultData();//apply new filter on display data
                return '';
            }

            //Showing something in the sessions list --> next in the sessions list
            for(var i = 0; i < $scope.numberOfSessions; i++){
                if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName && i != $scope.numberOfSessions - 1){
                    $scope.timeFilterFlag = $scope.sessionSummary[i+1].sessionName;
                    break;
                }
            }

            //last iteration, set to ALL
            if(i == $scope.numberOfSessions){
                $scope.timeFilterFlag = 'All';
            }

            window.localStorage.timeFilter = $scope.timeFilterFlag;
            currentFilterService.setSession($scope.timeFilterFlag);
            $scope.applyFilterOnResultData();//apply new filter on display data
        }




        //Time Filter not found warning
        $scope.displayWarningCheck = function() {

            if($scope.numberOfSessions == 0){
                return -1;
            }

            if($scope.timeFilterFlag == 'All'){ //Show all

                var activeCountSum = 0;
                var doneCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    activeCountSum += $scope.sessionSummary[i].activeCount;
                    doneCountSum += $scope.sessionSummary[i].doneCount;
                }

                if(activeCountSum == 0 && doneCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeCountSum == 0 && doneCountSum != 0){
                    return 1; //No active, all moved to History
                }
            }
            else{ //Show session wise

                var activeSessionCountSum = 0;
                var doneSessionCountSum = 0;

                for(var i = 0; i < $scope.numberOfSessions; i++){
                    if($scope.timeFilterFlag == $scope.sessionSummary[i].sessionName){
                        activeSessionCountSum = $scope.sessionSummary[i].activeCount;
                        doneSessionCountSum = $scope.sessionSummary[i].doneCount;
                        break;
                    }
                }
                
                if(activeSessionCountSum == 0 && doneSessionCountSum == 0){
                    return 0; //No reservations at all!
                }
                else if(activeSessionCountSum == 0 && doneSessionCountSum != 0){
                    return 1; //No active, all moved to History
                }

            }

            return -1;
        }

        $scope.quickSummary = function() {

            var myTemplate = '';

            var activeCount = 0;
            var activePAX = 0;

            var doneCount = 0;
            var donePAX = 0;

            for(var i = 0; i < $scope.numberOfSessions; i++){

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">'+$scope.sessionSummary[i].sessionName+' Session</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Pending</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activeCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].activePAX + '</div></div>'; // <--- Lunch Pending

                myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].doneCount + '</div><div class="col col-25" style="text-align: center">' + $scope.sessionSummary[i].donePAX + '</div></div>'; // <--- Lunch Done

                doneCount += $scope.sessionSummary[i].doneCount;
                donePAX += $scope.sessionSummary[i].donePAX;

            }


            /* All */
            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: bold; text-transform: uppercase; font-size: 12px"><div class="col" style="text-align: center; border-bottom: 1px solid #3c5064;">All Sessions</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e; font-weight: 300; text-transform: uppercase; font-size: 10px"><div class="col col-50">Status</div><div class="col col-25" style="text-align: center">Count</div><div class="col col-25" style="text-align: center">PAX</div></div>';

            myTemplate = myTemplate + '<div class="row" style="color: #34495e;"><div class="col col-50">Completed</div><div class="col col-25" style="text-align: center">' + doneCount + '</div><div class="col col-25" style="text-align: center">' + donePAX + '</div></div>'; // <--- All Done


            $ionicPopup.alert({
                title: 'Quick Summary',
                template: myTemplate,
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-balanced button-outline'
                }]
            });
        }



        $scope.openOptions = function(reservation) {

            var myPopup = "";

            if (reservation.statusCode == 0) {
                myPopup = $ionicPopup.show({
                    title: 'Options',
                    template: '<button class="button icon-left ion-android-checkbox-outline button-balanced button-block" ng-click="initAssignTable(\''+encodeURI(JSON.stringify(reservation))+'\')">Allot Seat</button>' +
                        '<button class="button icon-left ion-edit button-outline button-positive button-block" ng-click="initModifyReservation()">Edit Reservation</button>'+
                        '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Cancel Reservation</button>' +
                        '<button class="button icon-left ion-trash-a button-outline button-assertive button-block" ng-click="initDeleteReservation()">Mark Spam and Delete</button>',
                    scope: $scope,
                    buttons: [{
                        text: 'Close'
                    }]
                });

            } else if (reservation.statusCode == 1) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 2) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
                
            } else if (reservation.statusCode == 4) {
                myPopup = $ionicPopup.show({
                        title: 'Options',
                        template: '<button class="button icon-left ion-android-done button-outline button-balanced button-block" ng-click="initCompleteReservation()">Mark as Completed</button>' +
                            '<button class="button icon-left ion-android-cancel button-outline button-assertive button-block" ng-click="initCancelReservation()">Mark as Cancelled</button>',
                        scope: $scope,
                        buttons: [{
                            text: 'Close'
                        }]
                });
            } else if (reservation.statusCode == 5 || reservation.statusCode == 6) {
                $ionicLoading.show({
                    template: "This reservation is <b style='color: #e74c3c'>Cancelled</b>",
                    duration: 2000
                });
            } else {
                $ionicLoading.show({
                    template: "This reservation can not be edited",
                    duration: 2000
                });
            }


            $scope.assignTableNow = function(reservation){

                if(reservation.statusCode != 0 && reservation.statusCode != 1){
                    $ionicLoading.show({
                        template: "This reservation is already <b style='color: #2ecc71'>Completed</b>",
                        duration: 2000
                    });
                }
                else{
                        currentBooking.setBooking(reservation);
                        $state.go('main.reservationsapp.map');
                }
            }



            //Initialisers
            $scope.initAssignTable = function(encodedReservation) {
                myPopup.close();
                var reservation = JSON.parse(decodeURI(encodedReservation));
                $scope.assignTableNow(reservation);
            }

            $scope.initCancelReservation = function() {
                myPopup.close();
                $scope.cancelReservation(reservation);
            }

            $scope.initDeleteReservation = function() {
                myPopup.close();
                $scope.deleteReservation(reservation);
            }

            $scope.initModifyReservation = function() {
                myPopup.close();
                $scope.modifyReservation(reservation);
            }

            $scope.initCompleteReservation = function() {
                myPopup.close();
                $scope.completeReservation(reservation);
            }

        }

        $scope.quickView = function(reservation) {

            $ionicPopup.alert({
                title: 'Comments',
                template: '<p style="margin: 0; text-align: center; font-size: 16px; font-weight: 400; color: #2980b9;">' + reservation.comments + '</p>',
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-stable button-outline'
                }]
            });
        }


        //For Gen View only
        $scope.openSeatPlanView = function() {
            currentBooking.setBooking('');
            $state.go('main.reservationsapp.map');
        }

        $scope.getShortBrief = function(resObj) {
            if (resObj.statusCode == 0) {
                return resObj.time;
            } else if (resObj.statusCode == 1) {
                return resObj.timeLapse != '' ? resObj.timeLapse : resObj.time;
            } else if (resObj.statusCode == 2) {
                return 'Completed';
            } else if (resObj.statusCode == 4) {
                return 'Billing';
            } else if (resObj.statusCode == 5) {
                return 'Cancelled';
            }

        }


        $scope.Timer = $interval(function() {
            $scope.fetchData();
        }, 60000);
		
		$scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});




        $scope.newBook = function() {
            $state.go('main.app.walkin');
        }

        $scope.modifyReservation = function(reservation) {
            changeSlotService.setValues(reservation);
            $state.go('main.app.change');
        }

        $scope.completeReservation = function(reservation) {

            $ionicPopup.show({
                title: 'The tables allocated to <strong style="color: #e74c3c">' + reservation.user + '</strong> will automatically get released when you mark it \'Completed\'. Do you really want to mark this reservation as \'Completed\'?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Complete</b>',
                        type: 'button-balanced',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskmarkreservationcompleted.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
									timeout : 10000
                                })
                                .success(function(response) {
									$ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Marked Completed and tables released',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }


        $scope.cancelReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Do you really want to Cancel this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'No'
                    },
                    {
                        text: '<b>Yes, Cancel</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/cancelreservationsadmin.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
									timeout : 10000
                                })
                                .success(function(response) {
									$ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Cancelled',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });
        }

        $scope.deleteReservation = function(reservation) {

            $ionicPopup.show({
                title: 'Deleting a Reservation will delete it for ever. It can not be undone. Do you really want to delete this reservation by ' + reservation.user + '?',
                scope: $scope,
                buttons: [{
                        text: 'Cancel',
                        onTap: function(e) {
                            return true;
                        }
                    },
                    {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            var data = {};
                            data.id = reservation.id;
                            data.token = window.localStorage.admin;

                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/deskdeletereservation.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
									timeout : 10000
                                })
                                .success(function(response) {
									$ionicLoading.hide();
                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: 'Reservation Deleted',
                                            duration: 2000
                                        });
                                    } else {
                                        $ionicLoading.show({
                                            template: 'Error : ' + response.error,
                                            duration: 2000
                                        });
                                    }

                                    $scope.initReservations();
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });

        }

        $scope.goHome = function() {
            $state.go('main.app.landing');
        }

    })


    .controller('TablesCtrl', function($scope, $http, $state, $rootScope, $ionicSlideBoxDelegate, $ionicPopup, $ionicLoading, currentBooking) {

        if (_.isUndefined(window.localStorage.admin) || window.localStorage.admin == '') {
            $state.go('main.app.login');
        }


        /**** ACTUAL BEGINNING ***/
        $scope.isGeneralView = true;
        $scope.booking = currentBooking.getBooking();

        console.log($scope.booking)

        //Seater Area

        $scope.seatPlan = "";
        $scope.freeingAllList = "";
        $scope.seatPlanError = "";
        $scope.fetchTime = 'now';
        $scope.initSeatPlan = function() {

            $scope.seatPlanError = "";

            var data = {};
            data.token = window.localStorage.admin;
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            $http({
                    method: 'POST',
                    url: 'https://kopperkadai.online/services/deskfetchtables.php',
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
					timeout : 10000
                })
                .success(function(response) {
					$ionicLoading.hide();
                    if (response.status) {
                        $scope.seatPlanError = '';
                        $scope.fetchTime = response.time;
                        $scope.seatPlan = response.response;
                        $scope.freeingAllList = response.freeingList;
                    } else {
                        $scope.seatPlanError = response.error;
                    }
                })
                .error(function(data) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });
                });
        }

        $scope.initSeatPlan();


        $scope.holdList = []; //Seats to hold
        $scope.holdListCapacity = 0; //Capacity of hold seats
        $scope.allotedList = []; //Seats already alloted

        $scope.openSeatPlan = function(reservation) {

            if (reservation.statusCode == 0 || reservation.statusCode == 1) {
                $scope.guestInfo = reservation;
                $scope.holdList = [];
                $scope.holdListCapacity = 0;
                $scope.allotedList = [];
                $scope.initSeatPlan();

            } else {
                if (reservation.statusCode == 2) {
                    $ionicLoading.show({
                        template: "This reservation is already Completed",
                        duration: 2000
                    });
                } else if (reservation.statusCode == 5 || reservation.statusCode == 6) {
                    $ionicLoading.show({
                        template: "This reservation is Cancelled",
                        duration: 2000
                    });

                }
                $state.go('main.reservationsapp.upcoming');
            }
        }

        $scope.checkDeallot = function(seatID, guestID, seat) {
            if (seatID == guestID) {
                $scope.allotedList.push(seat);
            }
        }




        $scope.getMyClass = function(seat) {
            if (seat.status == 0) {
                return "button-balanced";
            } else if (seat.status == 1) {
                return "button-assertive";
            } else if (seat.status == 2) {
                return "button-energized";
            }
        }




        $scope.seatOptionsView = function(seat) {
            if (seat.status != 0) { //Seat Not Free
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Table ' + seat.name + ' is allocated to ' + seat.occupantData.name + '. Do you sure want to release ' + seat.name + '?',
                    scope: $scope,
                    buttons: [{
                            text: 'Cancel'
                        },
                        {
                            text: '<b>Release</b>',
                            type: 'button-assertive',
                            onTap: function(e) {

                                var data = {};
                                data.token = window.localStorage.admin;
                                data.id = seat.name;
                                data.bookingID = seat.occupantData.reservationID;
                                $ionicLoading.show({
                                    template: '<ion-spinner></ion-spinner>'
                                });
                                $http({
                                        method: 'POST',
                                        url: 'https://kopperkadai.online/services/deskreleasetables.php',
                                        data: data,
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        },
										timeout : 10000
                                    })
                                    .success(function(response) {
										$ionicLoading.hide();
                                        if (response.status) {
                                            $ionicLoading.show({
                                                template: "Table " + seat.name + " released",
                                                duration: 1000
                                            });
                                            $scope.initSeatPlan();
                                        } else {
                                            $ionicLoading.show({
                                                template: "Error: " + response.error,
                                                duration: 1000
                                            });

                                        }
                                    })
                                    .error(function(data) {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: "Not responding. Check your connection.",
                                            duration: 3000
                                        });
                                    });


                            }
                        },
                    ]
                });
            } else {
                $ionicLoading.show({
                    template: seat.name + " is already free",
                    duration: 1000
                });
            }
        }


        $scope.seatOptions = function(seat) {
            if ($scope.isGeneralView) {
                $scope.seatOptionsView(seat);
                return 0;
            }


            if (seat.status != 0) { //Seat Not Free
                $scope.seatOptionsView(seat);
            } else {
                if ($scope.holdList.length == 0) {
                    $scope.holdListCapacity = Number(seat.capacity);
                    $scope.holdList.push(seat.name);
                    document.getElementById("seat_" + seat.name).classList.remove('btn-success');
                    document.getElementById("seat_" + seat.name).classList.add('seatSelected');
                    document.getElementById("seatTag_" + seat.name).innerHTML = '<i class="fa fa-check"></i>';

                } else {
                    var index = $scope.holdList.indexOf(seat.name);
                    if (index > -1) { //Already in the list --> UNSELECT
                        $scope.holdList.splice(index, 1);
                        $scope.holdListCapacity = Number($scope.holdListCapacity) - Number(seat.capacity);
                        document.getElementById("seat_" + seat.name).classList.remove('seatSelected');
                        document.getElementById("seat_" + seat.name).classList.add('btn-success');
                        document.getElementById("seatTag_" + seat.name).innerHTML = (seat.occupant).substring(0, 20);
                        if ((seat.occupant).length > 20) {
                            document.getElementById("seatTag_" + seat.name).innerHTML += '...';
                        }
                    } else { //Not in the list --> SELECT
                        $scope.holdList.push(seat.name);
                        $scope.holdListCapacity = Number($scope.holdListCapacity) + Number(seat.capacity);
                        document.getElementById("seat_" + seat.name).classList.remove('btn-success');
                        document.getElementById("seat_" + seat.name).classList.add('seatSelected');
                        document.getElementById("seatTag_" + seat.name).innerHTML = '<i class="fa fa-check"></i>';
                    }
                }


            }
        }



        if ($scope.booking == "") {
            $scope.isGeneralView = true;
        } else {
            $scope.isGeneralView = false;
            $scope.openSeatPlan($scope.booking);
        }



        $scope.allocateSeats = function(name, code, list) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Do you want to allocate ' + list.toString() + ' to ' + name + '?',
                scope: $scope,
                buttons: [{
                        text: 'Cancel'
                    },
                    {
                        text: '<b>Allot</b>',
                        type: 'button-balanced',
                        onTap: function(e) {


                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });

                            var data = {};
                            data.token = window.localStorage.admin;
                            data.id = code;
                            data.tables = list; //JSON.stringify(list);
                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://kopperkadai.online/services/deskassigntable.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
									timeout : 10000
                                })
                                .success(function(response) {

                                    $ionicLoading.hide();

                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: "Tables allocated.",
                                            duration: 1000
                                        });

                                        $scope.initSeatPlan();
                                        $state.go('main.reservationsapp.upcoming');
                                    } else {

                                        $ionicLoading.show({
                                            template: "Error: " + response.error,
                                            duration: 1000
                                        });

                                    }
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });


        }

        $scope.deallocateSeats = function(code, incoming_list) {
			
			//Process Duplicates
			var list = incoming_list.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			})


            var confirmPopup = $ionicPopup.confirm({
                title: 'Do you want to release the tables ' + list.toString() + '?',
                scope: $scope,
                buttons: [{
                        text: 'Cancel'
                    },
                    {
                        text: '<b>Release</b>',
                        type: 'button-balanced',
                        onTap: function(e) {
                            var data = {};
                            data.token = window.localStorage.admin;
                            data.id = code;

                            $ionicLoading.show({
                                template: '<ion-spinner></ion-spinner>'
                            });
                            $http({
                                    method: 'POST',
                                    url: 'https://kopperkadai.online/services/deskreleasealltables.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
									timeout : 10000
                                })
                                .success(function(response) {
									
									$ionicLoading.hide();

                                    if (response.status) {
                                        $ionicLoading.show({
                                            template: "Tables released.",
                                            duration: 1000
                                        });

                                        $scope.initSeatPlan();
                                        $state.go('main.reservationsapp.upcoming');
                                    } else {

                                        $ionicLoading.show({
                                            template: "Error: " + response.error,
                                            duration: 1000
                                        });

                                    }
                                })
                                .error(function(data) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "Not responding. Check your connection.",
                                        duration: 3000
                                    });
                                });
                        }
                    },
                ]
            });

        }

        $scope.goBack = function() {
            $state.go('main.reservationsapp.upcoming');
        };
    })
;