/**
 * @providesModule CountryList
 * @flow
 */

var React = require('react-native')

var {
	ListView,
	View,
	Text,
	PixelRatio,
	StyleSheet,
	Image,
	TouchableHighlight,
	TabBarIOS
} = React;

var _ = require('lodash');
var visaRequirements = require('./visaRequirements');
var countryNames = require('./countryNames');

var ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (h1, h2) => h1 !== h2,
});

var okStatus = {
	'required': true,
	'on arrival': true
}
var getFreeAccess = function (countryCode) {
	var res = _(visaRequirements[countryCode]).map(function (v, k) {
		return [k, v];
	}).filter(function ([k,v]) {
		return !okStatus[v];
	}).value();
	return res;
};

var freeAccesses = _.map(visaRequirements, function (v, k) {
	return getFreeAccess(k).length;
});

var minFreeAccess = _.min(freeAccesses);
var maxFreeAccess = _.max(freeAccesses);

var backgroundScale = function (n) {
	var r = 255 - (n - minFreeAccess) / maxFreeAccess * 255;
	var g = (n - minFreeAccess) / maxFreeAccess * 255;
	return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + '0, 0.5)';
};

var countryList = _.map(_.sortBy(_.keys(visaRequirements), function (code) { return countryNames[code]; }), function (m) {
	return {
		name: countryNames[m],
		code: m,
		freeAccess: getFreeAccess(m)
	}
});

var comparators = {
	alpha:  function (code) { return countryNames[code]; },
	power:  function (code) { return -getFreeAccess(code).length; }
};

var getSource = function (cmpName : string) {
	var cmp = comparators[cmpName] || comparators['alpha'];
	var ls = _.map(_.sortBy(_.keys(visaRequirements), cmp), function (m) {
		return {
			name: countryNames[m],
			code: m,
			freeAccess: getFreeAccess(m)
		}
	});
	return ds.cloneWithRows(ls);
};

var CountryPage = React.createClass({
	render: function () {
		return (
			<View style={{ flex: 1, marginTop: 64 }}>
				<ListView
			        ref="listpageview"
			        dataSource={ this.getSource() }
			        renderFooter={this.renderFooter}
			        renderRow={this.renderRow}
			        onEndReached={this.onEndReached}
			        automaticallyAdjustContentInsets={false}
			        keyboardDismissMode="onDrag"
			        keyboardShouldPersistTaps={true}
			        showsVerticalScrollIndicator={false}
			      />
			</View>
		)
	},
	renderRow: function (obj) {
		return (
			<Text>{ countryNames[obj.code] } : { obj.status }</Text>
		);
	},
	onEndReached: function () {

	},
	renderFooter: function () {
		return <Text>CountryPageFooter</Text>
	},
	getSource: function () {
		return new ListView.DataSource({
		  rowHasChanged: (r1, r2) => r1 !== r2,
		  sectionHeaderHasChanged: (h1, h2) => h1 !== h2,
		}).cloneWithRows(
			_.map(visaRequirements[this.props.country.code], function (status, code) {
				return {
					code: code,
					status: status
				}
			})
		);
	}
});

var Badge = React.createClass({
	render: function () {
		return <Text>{ this.props.number }</Text>;
	}
})

var CountryCell = React.createClass({
	render: function () {
		var customStyle = {
			backgroundColor: backgroundScale(this.props.country.freeAccess.length )
		}
		return (
			<TouchableHighlight underlayColor='rgba(0,0,0,0.5)' onPress={this.props.onSelect}>
				<View style={ [styles.row, customStyle] }>
				    	<View>
							<Text style={ styles.rowText }>
								{ this.props.country.name }
							</Text>
							<Badge number={ this.props.country.freeAccess.length } />
						</View>
				</View>
			</TouchableHighlight>
		);
	}
});

var CountryList = React.createClass({
	getInitialState: function () {
		return {
			selectedTab: 'blueTab'
		};
	},

	render: function () {
		return (
			<TabBarIOS>
		        <TabBarIOS.Item
		          title="Blue Tab"
		          selected={ this.state.selectedTab == 'blueTab' }
		          onPress={ this.selectTab.bind(this, 'blueTab') }>
		          {this.renderList('alpha')}
		        </TabBarIOS.Item>
		        <TabBarIOS.Item
		          title="Sorted by Power"
		          selected={ this.state.selectedTab == 'redTab' }
		          onPress={ this.selectTab.bind(this, 'redTab') }>
		          { this.renderList('power') }
		        </TabBarIOS.Item>
		    </TabBarIOS>
		)
	},

	selectTab: function (value:string) {
		this.setState({
			selectedTab: value
		});
	},

	renderList: function (name: string) {
		return (
			<View style={ styles.container }>
			      <ListView
			        ref="listview"
			        dataSource={ getSource(name) }
			        renderFooter={this.renderFooter}
			        renderRow={this.renderRow}
			        onEndReached={this.onEndReached}
			        automaticallyAdjustContentInsets={false}
			        keyboardDismissMode="onDrag"
			        keyboardShouldPersistTaps={true}
			        showsVerticalScrollIndicator={false}
			      />
			</View>
		)
	},

	onEndReached: function () {
	},

	renderRow: function (country: Object): CountryCell {
		return <CountryCell country={country} onSelect={ this.goTo.bind(this, country) }/>;
	},

	goTo: function (country: Object) {
	    this.props.navigator.push({
	      title: country.name,
	      component: CountryPage,
	      passProps: {country},
	    });
	},

	renderFooter: function () {
		return <View><Text>Footer</Text></View>
	}
});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 64
	},
	rowText: {
		fontSize: 20
	},
	row: {
		padding: 10,
		borderBottomWidth: 1 / PixelRatio.get(),
		borderBottomColor: '#DDD'
	}
})

module.exports = CountryList;
