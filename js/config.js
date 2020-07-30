//espn auth vars
var leagueId = '628822';
var swid = '{8316E287-BB8F-4A74-96E2-87BB8FDA74C7}';
var espnAuth = '{"swid":"' + swid + '"}';
var espn_s2 = 'AEBV8PW2Q%2FxFSSNTnolXsVCGuRDNicapmOFO%2B7ovzxUgbSRAR6eb05twxVuuE8eBpGs1HRZKe%2BOc9Q4tzJbv6JkhTJwrvw2S34nIAwH0nqWJkqE8p499tHS5CI0oTeX4sQMBZuitDm8LYduqRL2C%2B%2FGMWJwEZISA9fWX23T%2F6ojS%2FMiN23QeOIpU7Cwyz1xFCoxmc%2FKyHQbOyV2sQTOrqVmM%2Fx8OwqyJit6wzByDKR2tRi3fBZFrYpA8%2B0DVl1XFwiNES%2BcXKpuw7P86%2B4r1qNKKPhQVUNluLIl7yepIsaGOlA%3D%3D';
var leagueDataPath = 'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/628822?view=mLiveScoring&view=mMatchupScore&view=mStandings&view=mStatus&view=mTeam&seasonId=';
var curYearLeaguePath =  'https://fantasy.espn.com/apis/v3/games/ffl/seasons/';
var curYearLeaguePathEnd = '/segments/0/leagues/' + leagueId + '?view=mMatchupScore&view=mScoreboard&view=mTeam&view=mPendingTransactions&view=modular&view=mNav';
//global data array
var leagueYears = [];
var allLeagueData = [];
var allSeasonData = [];
var allTeamData = [];
var eachTeamData = [];
var curMembers = [];
var atMembers = [];
var recentSeason = [];
var scheduleData = [];
var allScheduleData = [];
var allTeamIdData = [];
var eachTeamIdData = [];
//date data
var firstYear = 2012;
var date = new Date();
var curYear = date.getFullYear();
var intYear = date.getFullYear() - 1;
var legYears = date.getFullYear() - firstYear;
var chadId = 122;
var washId = 33;
//UI options
var useAllTime = false;
var defaultSort = 'data-wp';
var tagline = legYears + ' years of extraordinary genitals.'

var teamStatTemplate =
'<article id="teamStats">' +
'<div id="teamStatsInner" class="visible"></div>' +
'<div id="compareStatsInner"></div>' +
'</article>';

//accolade data
var accoladeData = {
  'Brandon_Zippe': {
    'titles': ['2015'],
    'toiletBowl': []
  },
  'Chad_Kohl': {
    'titles': [],
    'toiletBowl': []
  },
  'Cole_Lujan': {
    'titles': [],
    'toiletBowl': ['2014', '2016']
  },
  'David_Dunnigan':{
    'titles': [],
    'toiletBowl': []
  },
  'David_Olivo': {
    'titles': ['2013'],
    'toiletBowl': ['2019']
  },
  'Jordan_Fox': {
    'titles': [],
    'toiletBowl': ['2018']
  },
  'Kevin_Dunnigan': {
    'titles': ['2016'],
    'toiletBowl': []
  },
  'Nick_Mayfield': {
    'titles': ['2019'],
    'toiletBowl': ['2017']
  },
  'Stephen_Smith': {
    'titles': ['2012'],
    'toiletBowl': ['2013']
  },
  'anthony_washington': {
    'titles': [],
    'toiletBowl': ['2015']
  },
  'garrett_maldonado': {
    'titles': ['2017', '2018'],
    'toiletBowl': []
  },
  'hunter_abel': {
    'titles': [],
    'toiletBowl': []
  },
  'joseph_Cantu': {
    'titles': ['2014'],
    'toiletBowl': ['2012']
  },
  'matthew_salyers': {
    'titles': [],
    'toiletBowl': []
  }
};
