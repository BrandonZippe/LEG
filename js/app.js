var dataHandler = {
    //methods
    setCookies: function () {
      document.cookie = 'espnAuth=' + espnAuth;
      document.cookie = 'espnS2=' + espn_s2;
      document.cookie = 'SWID=' + swid;
      dataHandler.setLeagueYears();
    },
    setLeagueYears: function() {
      for (i = firstYear; i <= date.getFullYear(); i++) {

        leagueYears.push(i.toString());

        if (leagueYears.length - 1 === legYears) {
          dataHandler.fetchLeagueData();
        }

      }
    },
    fetchLeagueData: function () {
      $.each(leagueYears, function(i) {

          var eachYear = leagueYears[i];
          var reqPath = leagueDataPath + eachYear;

          // if (Number(eachYear) === 2019) {
          //   console.log(curYear);
          //   //reqPath = curYearLeaguePath + eachYear + curYearLeaguePathEnd;
          //   reqPath = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2019/segments/0/leagues/628822?view=mMatchupScore&view=mScoreboard&view=mStatus&view=mSettings&view=mTeam&view=mPendingTransactions&view=modular&view=mNav";
          //   console.log(reqPath);
          // }

          $.ajax({
                url: reqPath,
                type: 'GET',
                dataType: 'json',
                cache: true,
                success: function (data, textStatus, xhr) {
                  if (textStatus === 'success') {
                    dataHandler.prepData(data[0]);
                  }
                },
                error: function (xhr, textStatus, errorThrown) {
                  if (Number(eachYear) != Number(curYear)) {
                    $.getJSON( "./json/" + eachYear + ".json", function( data ) {
                      dataHandler.prepData(data);
                		});
                  } else {
                    //TODO Handle error
                    var errorMsg = textStatus + ': No data available for the ' + eachYear + ' season yet.';
                    console.log(errorMsg);
                  }
                }
            });
      });
    },
    prepData: function(data) {
      allLeagueData.push(data);

      function compare(a, b) {
          if (a.seasonId < b.seasonId) {
              return -1;
          }
          if (a.seasonId > b.seasonId) {
              return 1;
          }
          return 0;
      }
      allLeagueData.sort(compare);
      dataHandler.parseData(data);

      if (leagueYears.length == allLeagueData.length) {

      }
    },
    parseData: function(data) {
        var year = data.seasonId;
        var teamData = [];
        var teamIdData = [];

        $.each(data.teams, function(i) {

            var teams = data.teams[i];
            var teamId = teams.id;

            var id = teams.primaryOwner;
            var owner = '';

            $.each(data.members, function(index) {
                var member = data.members[index];
                var mId = member.id;
                if (mId === id) {
                    var fn = member.firstName;
                    var ln = member.lastName;
                    owner = fn + '_' + ln;
                }
            });

            var teamName = teams.location + ' ' + teams.nickname;
            var record = teams.record;
            var logo = teams.logo;
            var transactions = teams.transactionCounter;
            if (year <= 2016 && teamId === 3) {
                teamId = washId;
            }
            if (year <= 2018 && teamId === 12) {
                teamId = chadId;
            }
            teamData = {
                "season": year,
                "teamId": teamId,
                "owner": owner,
                "record": record,
                "teamName": teamName,
                "logo": logo,
                "transactions": transactions
            }

            teamIdData = {"owner": owner,"teamId": teamId};
            eachTeamIdData.push(teamIdData);


            eachTeamData.push(teamData);

            //create all time members array
            if (!atMembers.includes(owner)) {
                atMembers.push(owner);
            }


            //create current members array
            if (year === intYear) {
                var curNum = data.teams.length;

                //update recent season data
                recentSeason.push(data);

                if (!curMembers.includes(owner)) {
                    curMembers.push(owner);
                }
            }

        });

        //dataHandler.setTeamObj();
        allTeamData = _.groupBy(eachTeamData, "owner");
        allTeamIdData = _.groupBy(eachTeamIdData, "teamId");
        allSeasonData = _.groupBy(eachTeamData, "season");

        if (allLeagueData.length === legYears) {
            pageBuilder.initPage();
            dataHandler.buildCompData();
        }

    },
    setTeamObj: function() {

        $.each(atMembers, function(i) {

            var member = atMembers[i];
            dataHandler.buildTeamObj(member);

        });
    },
    buildTeamObj: function(member) {
        $('main').append(teamStatTemplate);
        //$('#teamStatsInner').html('');
        var eachSeason = '';
        var allSeasons = '';
        var eachNav = '';
        var allNavs = '';
        var owner = member.replace('_', ' ');
        var statTitle = '<h2>' + owner + ' Stats by Season</h2>';
        var compTitle = '<h2>' + owner + ' vs. the L.E.G.</h2>';
        var closeBtn = '<span class="closeStats" onclick="utils.closeTeamStats()">X</span>';
        var teamId = allTeamData[member][0].teamId;
        if (member.toLowerCase() === 'anthony_washington') {
            teamId = washId;
        }
        if (member.toLowerCase() === 'chad_kohl') {
            teamId = chadId;
        }
        var compNav = pageBuilder.prepCompNav(teamId, member);

        function compare(a, b) {
            if (a.season < b.season) {
                return -1;
            }
            if (a.season > b.season) {
                return 1;
            }
            return 0;
        }
        allTeamData[member].sort(compare);

        $.each(allTeamData[member], function(i) {
            var data = allTeamData[member][i];

            $.each(data, function(index) {
                if (member == data.owner) {
                  var recData = data.record.overall;
                  var pf = recData.pointsFor;
                  var pa = recData.pointsAgainst;
                  var wins = recData.wins;
                  var ties = recData.ties;
                  var loss = recData.losses;
                  var perc = recData.percentage;
                  var season = data.season;
                  var teamName = data.teamName;
                  var logo = data.logo;
                  var logoStr = '';
                  if (logo !== undefined) {
                      logoStr = '<div class="teamLogo"><img src="' + logo + '" /></div>';
                  }
                  var td = data.transactions;
                  var aquis = td.acquisitions;
                  var trades = td.trades;
                  var selected = '';

                  if (season === firstYear || i === 0) {
                      selected = ' selected';
                  }

                  eachSeason =
                      '<div id="season_' + season + '" class="stats' + selected + '">' +
                      '<div class="teamName">' + logoStr + teamName + '</div>' +
                      '<span class="wins">' + wins + '</span>' +
                      '<span class="losses">' + loss + '</span>' +
                      '<span class="ties">' + ties + '</span>' +
                      '<span class="winperc">' + perc.toFixed(3) + '%</span>' +
                      '<span class="pf">' + pf.toFixed(2) + '</span>' +
                      '<span class="pa">' + pa.toFixed(2) + '</span>' +
                      '<span class="aqui">' + aquis + '</span>' +
                      '<span class="trades">' + trades + '</span>' +
                      '</div>';

                  eachNav = '<span data-season="season_' + season + '" class="seasonSortBtn' + selected + '" onclick="utils.toggleSeasonStat(' + "'" + 'season_' + season + "'" + ')">' + season + '</span>';

                }
            });

            allSeasons += eachSeason;
            allNavs += eachNav;

        });
        var navStr = '<nav>' + allNavs + '</nav>';
        compNav = '<nav>' + compNav + '</nav>';
        var navCont = '<nav><div class="on single" onclick="utils.toggleContent(' + "'" + 'single' + "'" + ')">Team</div><div class="compare" onclick="utils.toggleContent(' + "'" + 'compare' + "'" + ')">Compare</div></nav>';
        allSeasons =  closeBtn + statTitle + navCont + navStr + allSeasons;
        $('#teamStatsInner').html(allSeasons);
        $('#compareStatsInner').html(closeBtn + compTitle + navCont + compNav + '<div id="compStats"></div>');

    },
    sortTeams: function(method) {
        var $wrapper = $('#allTimeMembers');

        $wrapper.find('.statTile').sort(function(a, b) {
            return (+$(a).attr(method) > +$(b).attr(method)) ?
                -1 : (+$(a).attr(method) < +$(b).attr(method)) ?
                1 : 0;
        }).appendTo($wrapper);

        $('.stats span').removeClass('sortedBy');

        var target = '';
        switch (method) {
            case 'data-win':
                target = $('.record');
                break;
            case 'data-title':
                target = $('.titles');
                break;
            case 'data-wp':
                target = $('.winperc');
                break;
            case 'data-pf':
                target = $('.pf');
                break;
            case 'data-pa':
                target = $('.pa');
				break;
			case 'data-tb':
				target = $('.toiletBowl');
            default:
                // code block
        }

        target.addClass('sortedBy');
        pageBuilder.addRank();
    },
    buildCompData: function () {
        $.each(allLeagueData, function(i){
            var seasonSchedule = '';
            var d = allLeagueData[i];
            var sd = d.schedule;
            var season = d.seasonId;
            seasonSchedule = {
                "schedule": sd,
                "season": season
            }
            scheduleData.push(seasonSchedule);

        });

        allScheduleData = _.groupBy(scheduleData, "season");

    },
    parseCompData: function(a, b, name) {
        var compData = [];
        $.each(leagueYears, function(i){
            var eachYear = Number(leagueYears[i]);
            var eachDataSet = allScheduleData[eachYear];


            if (eachDataSet !== undefined) {
                var sd = eachDataSet[0].schedule;

                $.each(sd, function(index){
                    var data = sd[index];
                    var winner = data.winner;

                    if (winner !== 'UNDECIDED') {
                        var awayId = data.away.teamId;
                        var homeId = data.home.teamId;

                        if (eachYear <= '2016') {
                            if (awayId === 3) {
                                data.away.teamId = washId;
                            }
                            if (homeId === 3) {
                                data.home.teamId = washId;
                            }
                        }

                        if (eachYear <= '2018') {
                            if (awayId === 12) {
                                data.away.teamId = chadId;
                            }
                            if (homeId === 12) {
                                data.home.teamId = chadId;
                            }
                        }

                        if  (homeId ===  a && awayId === b) {
                            compData.push(data);
                        } else if (homeId === b && awayId === a){
                            compData.push(data);
                        }
                    }

                });
            }

        });

        pageBuilder.drawCompare(compData, a, b, name);
    },
    comparePlayers: function (a, b, name, id) {
        dataHandler.parseCompData(a, b, name);
        utils.toggleCompNav(id);
    }
}

var pageBuilder = {
    //methods
    initPage: function() {

        $('#allTimeMembers').html('');
        var targetAT = $('#allTimeMembers');
		var members = curMembers;

		if (useAllTime) {
			members = atMembers;
		}

        $.each(members, function(i) {
            var memberDiv = '<div id="' + members[i] + '" class="statTile" onclick="easterEggs.statTileClick(' + "'" + members[i] + "'" + ')"></div>';
            if ($('#allTimeMembers div').length < members.length) {
                targetAT.append(memberDiv);
            }
        });

        if ($('#allTimeMembers div').length == members.length) {
            pageBuilder.drawMembers();
        }

    },
    drawMembers: function() {


        $.each($('#allTimeMembers div'), function() {
            var team = $(this).attr('id');
            var ad = accoladeData[team];
            var titleData = ad['titles'];
            var tbData = ad['toiletBowl'];
            var eachStat = '';
            var totalPointsFor = '';
            var totalPointsA = '';
            var totalWins = '';
            var totalLoss = '';
            var totalTies = '';
            var pointsForArr = [];
            var pointsAgainstArr = [];
            var winArr = [];
            var lossArr = [];
            var tiesArr = [];
            var lossStreak = [];
			var winStreak = [];

            $.each(allTeamData[team], function(i) {
                var teamId = allTeamData[team][i].teamId;
				var d = allTeamData[team][i].record.overall;

                //points For
                var pointsFor = d.pointsFor;
                pointsForArr.push(pointsFor);
                totalPointsFor = pointsForArr.reduce(utils.getSum);

                //points against
                var pointsA = d.pointsAgainst;
                pointsAgainstArr.push(pointsA);
                totalPointsA = pointsAgainstArr.reduce(utils.getSum);

                //wins
                var wins = d.wins;
                winArr.push(wins);
                totalWins = winArr.reduce(utils.getSum);

                //losses
                var loss = d.losses;
                lossArr.push(loss);
                totalLoss = lossArr.reduce(utils.getSum);

                //ties
                var ties = d.ties;
                var totalTiesStr = '';
                tiesArr.push(ties);
                totalTies = tiesArr.reduce(utils.getSum);
                if (totalTies !== 0) {
                  totalTiesStr = ' - ' + totalTies.toString();
                }


                //win percentage
                var winPerc = totalWins + totalLoss;
                winPerc = totalWins / winPerc;

                //titles
                var titleNum = titleData.length;
                var titleYears = titleData;
                var titleYearsStr = '';
                if (titleNum !== 0) {
                    titleYearsStr = ' (' + titleYears + ')';
				}

				//set current champ
				if ($.inArray(intYear.toString(), titleYears) != -1) {
					$('#' + team).addClass('currentChamp');
				}

                //toilet bowl
                var tbNum = tbData.length;
                var tbYears = tbData;
                var tbStr = '';
                if (tbNum !== 0) {
                    tbStr = '(' + tbYears + ')';
				}

				//set current TB
				if ($.inArray(intYear.toString(), tbYears) != -1) {
					$('#' + team).addClass('currentToilet');
				}

                var teamFr = team.replace('_', ' ');

				eachStat =
                    '<div class="stats">' +
                    '<span class="team">' + teamFr + '</span>' +
                    '<span class="record">' + totalWins + ' - ' + totalLoss + totalTiesStr + '</span>' +
                    '<span class="winperc">' + winPerc.toFixed(3) + '%</span>' +
                    '<span class="pf">' + totalPointsFor.toFixed(2) + '</span>' +
                    '<span class="pa">' + totalPointsA.toFixed(2) + '</span>' +
                    '<span class="titles">' + titleNum + ' ' + titleYearsStr + '</span>' +
                    '<span class="toiletBowl">' + tbNum + ' ' + tbStr + '</span>' +
                    '</div>';

                $('#' + team).attr('data-win', totalWins);
                $('#' + team).attr('data-wp', winPerc.toFixed(3));
                $('#' + team).attr('data-pf', totalPointsFor.toFixed(2));
                $('#' + team).attr('data-pa', totalPointsA.toFixed(2));
                $('#' + team).attr('data-title', titleNum);
                $('#' + team).attr('data-tb', tbNum);
                $('#' + team).attr('data-compId', teamId);
                $('#' + team).html(eachStat);

            });
        });

		var sort = $('.sortBtn.selected').attr('id');
		if (sort === undefined) {
			sort = defaultSort;
		}
        dataHandler.sortTeams(sort);
        $('#' + sort).addClass('selected');
        pageBuilder.addRank();
    },
    addRank: function() {
        var $statTile = $('.statTile');
        $('.rank').remove();
        $.each($statTile, function(i) {
            var rank = i + 1;
            var rankHtml = '<span class="rank">' + rank + '</span>';
            $(this).prepend(rankHtml);
        });
	},
	  setMembers: function(members) {
		if (members === 'allTime') {
			useAllTime = true;
		} else if (members === 'current') {
			useAllTime = false;
		}
		$('nav div').removeClass('on');
		$('#' + members).addClass('on');
		pageBuilder.initPage();
	},
	  updateTagline: function () {
		$('.fancy').text(tagline);
    },
    prepCompNav: function (curId) {
        var eachNav = '';
        var allNav = '';
        $.each(atMembers, function(i){
            var member = atMembers[i];
            var memberName = member.replace('_', ' ');

            var teamId = allTeamData[member][0].teamId;
            if (member.toLowerCase() === 'anthony_washington') {
                teamId = washId;
            }

            if (member.toLowerCase() === 'chad_kohl') {
                teamId = chadId;
            }

            if (teamId !== curId) {
                eachNav = '<span data-id="id_' + teamId + '" class="seasonSortBtn" onclick="dataHandler.comparePlayers(' +  Number(curId) + ', ' + Number(teamId) + ', ' + "'" + member + "'" + ', ' + "'" + 'id_' + teamId + "'" + ')">' + memberName + '</span>';
            } else {
                eachNav = '';
            }
            allNav += eachNav;
        });
        return allNav;
    },
    drawCompare: function (data, curId, oppId, oppName) {
        $('#compStats').html('');
        if (data.length !== 0) {
            var totalGames = data.length;
            var curPlayerWins = [];
            var curPlayerLoss = [];
            var curPlayerPoints = [];
            var oppPlayerWins = [];
            var oppPlayerLoss = [];
            var oppPlayerPoints = [];
            var curOppTies = [];
            var eachCurWinScore = [];
            var eachOppWinScore = [];
            var curHomeWins = [];
            var curHomeGames = [];
            var curRoadWins = [];
            var curRoadGames = [];
            var oppHomeWins = [];
            var oppHomeGames = [];
            var oppRoadWins = [];
            var oppRoadGames = [];
            var curPlayoffWins = [];
            var curPlayoffLoss = [];
            var oppPlayoffWins = [];
            var oppPlayoffLoss = [];
            var curPlayoffWinsWB = [];
            var curPlayoffLossWB = [];
            var curPlayoffWinsLB = [];
            var curPlayoffLossLB = [];
            var oppPlayoffWinsWB = [];
            var oppPlayoffLossWB = [];
            var oppPlayoffWinsLB = [];
            var oppPlayoffLossLB = [];
            var curPlayer = allTeamIdData[curId][0].owner;
            curPlayer = curPlayer.replace('_', ' ');
            var oppName = oppName.replace('_', ' ');
            var compTemplate = '';

            $.each(data, function(i){
                var winner = data[i].winner;
                var homeId = data[i].home.teamId;
                var awayId = data[i].away.teamId;
                var homePts = data[i].home.totalPoints;
                var awayPts = data[i].away.totalPoints;
                var playoff = data[i].playoffTierType;


                if (winner === 'HOME') {
                    if (homeId === curId) {
                        curPlayerWins.push(winner);
                        curPlayerPoints.push(homePts);
                        curHomeWins.push(winner);
                        eachCurWinScore.push(homePts + '-' + awayPts);
                        oppPlayerLoss.push('AWAY');
                        oppPlayerPoints.push(awayPts);
                        curHomeGames.push('HOME');
                        oppRoadGames.push('AWAY');
                        if (playoff !== 'NONE') {
                          curPlayoffWins.push(playoff);
                          oppPlayoffLoss.push(playoff);
                          if (playoff === 'WINNERS_BRACKET' || playoff === 'WINNERS_CONSOLATION_LADDER') {
                            curPlayoffWinsWB.push(playoff);
                            oppPlayoffLossWB.push(playoff);
                          } else if (playoff === 'LOSERS_CONSOLATION_LADDER') {
                            curPlayoffWinsLB.push(playoff);
                            oppPlayoffLossLB.push(playoff);
                          }
                        }
                    } else if (homeId === oppId) {
                        oppPlayerWins.push(winner);
                        oppPlayerPoints.push(homePts);
                        oppHomeWins.push(winner);
                        eachOppWinScore.push(homePts + '-' + awayPts);
                        curPlayerLoss.push('AWAY');
                        curPlayerPoints.push(awayPts);
                        curRoadGames.push('AWAY');
                        oppHomeGames.push('HOME');
                        if (playoff !== 'NONE') {
                          oppPlayoffWins.push(playoff);
                          curPlayoffLoss.push(playoff);
                          if (playoff === 'WINNERS_BRACKET' || playoff === 'WINNERS_CONSOLATION_LADDER') {
                            oppPlayoffWinsWB.push(playoff);
                            curPlayoffLossWB.push(playoff);
                          } else if (playoff === 'LOSERS_CONSOLATION_LADDER') {
                            oppPlayoffWinsLB.push(playoff);
                            curPlayoffLossLB.push(playoff);
                          }
                        }
                    }
                } else if (winner === 'AWAY') {
                    if (awayId === curId) {
                        curPlayerWins.push(winner);
                        curPlayerPoints.push(awayPts);
                        curRoadWins.push(winner);
                        eachCurWinScore.push(awayPts + '-' + homePts);
                        oppPlayerLoss.push('HOME');
                        oppPlayerPoints.push(homePts);
                        curRoadGames.push('AWAY');
                        oppHomeGames.push('HOME');
                        if (playoff !== 'NONE') {
                          curPlayoffWins.push(playoff);
                          oppPlayoffLoss.push(playoff);
                          if (playoff === 'WINNERS_BRACKET' || playoff === 'WINNERS_CONSOLATION_LADDER') {
                            curPlayoffWinsWB.push(playoff);
                            oppPlayoffLossWB.push(playoff);
                          } else if (playoff === 'LOSERS_CONSOLATION_LADDER') {
                            curPlayoffWinsLB.push(playoff);
                            oppPlayoffLossLB.push(playoff);
                          }
                        }
                    } else if (awayId === oppId) {
                        oppPlayerWins.push(winner);
                        oppPlayerPoints.push(awayPts);
                        oppRoadWins.push(winner);
                        eachOppWinScore.push(awayPts + '-' + homePts);
                        curPlayerLoss.push('HOME');
                        curPlayerPoints.push(homePts);
                        curHomeGames.push('HOME');
                        oppRoadGames.push('AWAY');
                        if (playoff !== 'NONE') {
                          oppPlayoffWins.push(playoff);
                          curPlayoffLoss.push(playoff);
                          if (playoff === 'WINNERS_BRACKET' || playoff === 'WINNERS_CONSOLATION_LADDER') {
                            oppPlayoffWinsWB.push(playoff);
                            curPlayoffLossWB.push(playoff);
                          } else if (playoff === 'LOSERS_CONSOLATION_LADDER') {
                            oppPlayoffWinsLB.push(playoff);
                            curPlayoffLossLB.push(playoff);
                          }
                        }
                    }
                }

                if (winner === 'TIE') {
                    curOppTies.push(winner);
                    curPlayerPoints.push(homePts);
                    oppPlayerPoints.push(homePts);
                }

            });
            // console.log(curPlayerWins);
            // console.log(curPlayerPoints);
            // console.log(curPlayerLoss);
            //console.log(eachCurWinScore);
            // console.log(curHomeWins);
            // console.log(curRoadWins);
            // console.log(curHomeGames);
            // console.log(curRoadGames);

            // console.log(oppPlayerWins);
            // console.log(oppPlayerPoints);
            // console.log(oppPlayerLoss);
            //console.log(eachOppWinScore);
            // console.log(oppRoadWins);
            // console.log(oppHomeWins);
            // console.log(oppHomeGames);
            // console.log(oppRoadGames);

            // console.log(curPlayoffLossLB);
            // console.log(curPlayoffLossWB);
            // console.log(curPlayoffWinsLB);
            // console.log(curPlayoffWinsWB);
            // console.log(oppPlayoffLossLB);
            // console.log(oppPlayoffLossWB);
            // console.log(oppPlayoffWinsLB);
            // console.log(oppPlayoffWinsWB);

            //build overall record info
            var curWins = curPlayerWins.length;
            var curWinPerc = utils.getWinPerc(curWins, totalGames);
            var curBarWidth =  utils.getCompBarWidth(curWinPerc);
            var oppWins = oppPlayerWins.length;
            var oppWinPerc = utils.getWinPerc(oppWins, totalGames);
            var oppBarWidth = utils.getCompBarWidth(oppWinPerc);
            var ties = curOppTies.length;
            var tieBarStr = '';
            var tieStatsStr = '';
            if (ties !== 0) {
                var tiesPerc = utils.getWinPerc(ties, totalGames);
                var tiesBarWidth = utils.getCompBarWidth(tiesPerc);
                tieBarStr = '<div class="tieBar" style="width: ' + tiesBarWidth + ';"></div>';
                tieStatsStr =
                '<div id="tieStats" class="barStats" style="width: ' + tiesBarWidth + ';">' +
                '<span id="barTies" class="Wins">' + ties + '</span>' +
                '</div>';
            }

            //build home and road info
            var curHW = curHomeWins.length;
            var curHG = curHomeGames.length;
            var curHWP = utils.getWinPerc(curHW, curHG);

            var curRW = curRoadWins.length;
            var curRG = curRoadGames.length;
            var curRWP = utils.getWinPerc(curRW, curRG);

            var oppRW = oppRoadWins.length;
            var oppRG = oppRoadGames.length;
            var oppRWP = utils.getWinPerc(oppRW, oppRG);

            var oppHW = oppHomeWins.length;
            var oppHG = oppHomeGames.length;
            var oppHWP = utils.getWinPerc(oppHW, oppHG);

            //build points info
            var curTotalPoints = curPlayerPoints.reduce(utils.getSum);
            var oppTotalPoints = oppPlayerPoints.reduce(utils.getSum);
            var totalPoints = curTotalPoints + oppTotalPoints;
            var curPtsperc = curTotalPoints * 100;
            var curPtsWidth = curPtsperc / totalPoints;
            curPtsWidth = curPtsWidth + '%';
            var oppPtsperc = oppTotalPoints * 100;
            var oppPtsWidth = oppPtsperc / totalPoints;
            oppPtsWidth = oppPtsWidth + '%'

            //build margin of victory info
            var curMargin = utils.getVictoryMargin(eachCurWinScore);
            var curMarginArr = curMargin.split('_');
            var curMarginScore = curMarginArr[0];
            var curMarginPts = curMarginArr[1];
            var oppMargin = utils.getVictoryMargin(eachOppWinScore);
            var oppMarginArr = oppMargin.split('_');
            var oppMarginScore = oppMarginArr[0];
            var oppMarginPts = oppMarginArr[1];
            var currOppTotal = Number(oppMarginPts) + Number(curMarginPts);
            var curMarginWidth =  (curMarginPts * 100) / currOppTotal;
            curMarginWidth = curMarginWidth + '%';
            var oppMarginWidth = (oppMarginPts * 100) / currOppTotal;
            oppMarginWidth = oppMarginWidth + '%';

            if (curMarginPts === undefined) {
                curMarginPts = 'Gotta Win First';
                curMarginScore = 'HAHAHA';
                oppMarginWidth = '80%';
                curMarginWidth = '20%';
            } else {
                curMarginPts = Number(curMarginPts).toFixed(2) + ' points';
            }

            if (oppMarginPts === undefined) {
                oppMarginPts = 'YoU CaNt WIn!?!';
                oppMarginScore = 'sAd';
                curMarginWidth = '80%';
                oppMarginWidth = '20%';
            } else {
                oppMarginPts = Number(oppMarginPts).toFixed(2) + ' points';
            }

            //playoff wins and loss'
            var playoffCompare = '';
            var sweepStr = 'Sweep!';
            var sweepClass = ' sweep';
            var curSweepStr = '';
            var curSweepClass = '';
            var oppSweepStr = '';
            var oppSweepClass = '';
            var curPOwins = curPlayoffWins.length;
            var curPOloss = curPlayoffLoss.length;
            var oppPOwins = oppPlayoffWins.length;
            var curPOloss = oppPlayoffLoss.length;
            var playoffTotal = Number(curPOwins) + Number(oppPOwins);
            var curPlayoffWP = utils.getWinPerc(curPOwins, playoffTotal);
            var oppPlayoffWP = utils.getWinPerc(oppPOwins, playoffTotal);
            var curPlayoffWidth = utils.getCompBarWidth(curPlayoffWP);
            var oppPlayoffWidth = utils.getCompBarWidth(oppPlayoffWP);

            if (oppPOwins === 0) {
              curSweepStr = sweepStr;
              curSweepClass = sweepClass;
            }

            if (curPOwins === 0) {
              oppSweepStr = sweepStr;
              oppSweepClass = sweepClass;
            }

            if (playoffTotal !== 0) {
              playoffCompare =
              '<div class="compBarStats">' +
                  '<h3>Playoffs</h3>' +
                  '<div id="curPlayerStats" class="barStats" style="width: ' + curPlayoffWidth + ';">' +
                      '<span id="curBarWins" class="barWins">' + curPOwins + '</span>' +
                      '<span class="wPerc">(' + curPlayoffWP + ')</span>' +
                  '</div>' +
                  '<div id="oppPlayerStats" class="barStats" style="width: ' + oppPlayoffWidth + ';">' +
                      '<span id="oppBarWins" class="barWins">' + oppPOwins + '</span>' +
                      '<span class="wPerc">(' + oppPlayoffWP + ')</span>' +
                  '</div>' +
              '</div>' +
              '<div class="compBar">' +
                  '<div class="curBar' + curSweepClass + '" style="width: ' + curPlayoffWidth + ';">' + curSweepStr + '</div>' +
                  '<div class="oppBar' + oppSweepClass + '" style="width: ' + oppPlayoffWidth + ';">' + oppSweepStr + '</div>' +
              '</div>';
            }


            compTemplate =
            '<div id="curPlayer" class="playerBox">' +
                '<span class="name">' + curPlayer + '</span>' +
            '</div>' +
            '<div id="oppPlayer" class="playerBox">' +
                '<span class="name">' + oppName + '</span>' +
            '</div>'+
            '<div class="midStats">' +
                '<div class="compBarStats">' +
                    '<h3>Wins</h3>' +
                    '<div id="curPlayerStats" class="barStats" style="width: ' + curBarWidth + ';">' +
                        '<span id="curBarWins" class="barWins">' + curWins + '</span>' +
                        '<span class="wPerc">(' + curWinPerc + ')</span>' +
                    '</div>' +
                    tieStatsStr +
                    '<div id="oppPlayerStats" class="barStats" style="width: ' + oppBarWidth + ';">' +
                        '<span id="oppBarWins" class="barWins">' + oppWins + '</span>' +
                        '<span class="wPerc">(' + oppWinPerc + ')</span>' +
                    '</div>' +
                '</div>' +
                '<div class="compBar">' +
                    '<div class="curBar" style="width: ' + curBarWidth + ';"></div>' +
                    tieBarStr +
                    '<div class="oppBar" style="width: ' + oppBarWidth + ';"></div>' +
                '</div>' +
                '<div id="home" class="compBarStats homeAway">' +
                    '<h3>Home</h3>' +
                    '<div id="curPlayerStats" class="barStats">' +
                        '<span id="curBarWins" class="barWins">' + curHW + '</span>' +
                        '<span class="wPerc">(' + curHWP + ')</span>' +
                    '</div>' +
                    '<div id="oppPlayerStats" class="barStats">' +
                        '<span id="oppBarWins" class="barWins">' + oppHW + '</span>' +
                        '<span class="wPerc">(' + oppHWP + ')</span>' +
                    '</div>' +
                '</div>' +
                '<div id="road" class="compBarStats homeAway">' +
                    '<h3>Road</h3>' +
                    '<div id="curPlayerStats" class="barStats">' +
                        '<span id="curBarWins" class="barWins">' + curRW + '</span>' +
                        '<span class="wPerc">(' + curRWP + ')</span>' +
                    '</div>' +
                    '<div id="oppPlayerStats" class="barStats">' +
                        '<span id="oppBarWins" class="barWins">' + oppRW + '</span>' +
                        '<span class="wPerc">(' + oppRWP + ')</span>' +
                    '</div>' +
                '</div>' +
                '<div class="compBarStats">' +
                    '<h3>Points</h3>' +
                    '<div id="curPlayerStats" class="barStats" style="width: ' + curPtsWidth + ';">' +
                        '<span class="totalPts">' + curTotalPoints.toFixed(2) + '</span>' +
                    '</div>' +
                    '<div id="oppPlayerStats" class="barStats" style="width: ' + oppPtsWidth + ';">' +
                    '<span class="totalPts">' + oppTotalPoints.toFixed(2) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="compBar">' +
                    '<div class="curBar" style="width: ' + curPtsWidth + ';"></div>' +
                    '<div class="oppBar" style="width: ' + oppPtsWidth + ';"></div>' +
                '</div>' +
                '<div class="compBarStats">' +
                '<h3>Largest Margin of Victory</h3>' +
                '<div id="curPlayerStats" class="barStats">' +
                    '<span id="curBarWins" class="barWins">' + curMarginScore + '</span>' +

                '</div>' +
                '<div id="oppPlayerStats" class="barStats">' +
                    '<span id="oppBarWins" class="barWins">' + oppMarginScore + '</span>' +

                '</div>' +
                '</div>' +
                '<div class="compBar">' +
                    '<div class="curBar" style="width: ' + curMarginWidth + ';"><span class="wPerc">' + curMarginPts + '</span></div>' +
                    '<div class="oppBar" style="width: ' + oppMarginWidth + ';"><span class="wPerc">' + oppMarginPts + '</span></div>' +
                '</div>' +
                playoffCompare +

            '</div>';


            $('#compStats').html(compTemplate);
        } else {
            $('#compStats').html('<div style="width: 100%;float:none;max-width: 150px;margin: 0 auto;"><img style="width: 100%"; src="./assets/img/tryagain.jpg"/></div>');
        }
    }
};

var utils = {
    closeTeamStats: function () {
        $('#teamStats').remove();
    },
    toggleSeasonStat: function (season) {
        $('.seasonSortBtn').removeClass('selected');
        $('.seasonSortBtn[data-season="' + season + '"]').addClass('selected');
        $('#teamStatsInner .stats').removeClass('selected');
        $('#' + season).addClass('selected');

    },
    toggleContent: function (content) {
        if (content === 'compare'){
            $('#teamStatsInner').removeClass('visible');
            $('#compareStatsInner').addClass('visible');
            $('.compare').addClass('on');
            $('.single').removeClass('on');
        } else if (content === 'single') {
            $('#compareStatsInner').removeClass('visible');
            $('#teamStatsInner').addClass('visible');
            $('.compare').removeClass('on');
            $('.single').addClass('on');
        }
    },
    toggleCompNav: function(id) {
        $('.seasonSortBtn').removeClass('selected');
        $('.seasonSortBtn[data-id="' + id + '"]').addClass('selected');
    },
    getVictoryMargin: function (data) {
        var victoryStr = '';
        if (data.length !== 0) {
            var diffArr = [];
            $.each(data, function(i){
                var eachScore = data[i];
                var eaArr = eachScore.split('-');
                var win = eaArr[0];
                var loss = eaArr[1];
                var diff = Number(win) - Number(loss);
                diffArr.push(diff);

            });

            function indexOfMax(arr) {
                if (arr.length === 0) {
                    return -1;
                }

                var max = arr[0];
                var maxIndex = 0;

                for (var i = 1; i < arr.length; i++) {
                    if (arr[i] > max) {
                        maxIndex = i;
                        max = arr[i];
                    }
                }

                return maxIndex;
            }

            var maxIndex = indexOfMax(diffArr);
            victoryStr = data[maxIndex] + '_' + diffArr[maxIndex];
            return victoryStr;

        } else {
            return victoryStr;
        }
    },
    getWinPerc: function (divide, total) {
      var percentage = Number(divide) / Number(total);
      percentage = percentage.toFixed(3);
      return percentage;
    },
    getCompBarWidth: function (num) {
      var width = Number(num) * 100;
      width = width + '%';
      return width;
    },
    getSum: function (total, num) {
      return total + num;
    }
};

var easterEggs = {
    statTileClick: function(id) {
        window.scrollTo(0, 300);

        //custom easter eggs
        if (id === 'joseph_Cantu') {
            if ($('#troll').length === 0) {
                $('header').append('<img id="troll" src="assets/img/peek.png" title="Cantu the Troll" alt="Cantu the Troll"/>');
            }
            setTimeout(function() {
                easterEggs.theTroll();
            }, 100);
        }

        //draw team stat content
        dataHandler.buildTeamObj(id);

    },
    theTroll: function() {
        $('#troll').addClass('peek');
        setTimeout(function() {
            $('#troll').removeClass('peek');
        }, 6000);
    }
};

$(document).ready(function() {
	  pageBuilder.updateTagline();
    dataHandler.setCookies();
});

$('.sortBtn').click(function() {

    $('.sortBtn').removeClass('selected');
    $(this).addClass('selected');
    var method = $(this).attr('id');

    dataHandler.sortTeams(method);
});


// react
'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}
