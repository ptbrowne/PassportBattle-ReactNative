/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var _ = require('lodash');
var CountryList = require('./CountryList');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  NavigatorIOS
} = React;

var PassportBattle = React.createClass({
  render: function() {
    return (
     <NavigatorIOS
      style={ styles.navigator }
      initialRoute={{
        title: 'Country List',
        component: CountryList,
        itemWrapperStyle: styles.wrapper
      }} />
    );
  }
});

var styles = StyleSheet.create({
  navigator: {
    flex: 1,
  },
  wrapper: {
    fontSize: 20,
    backgroundColor: 'royalblue',
    color: 'white'
  }
});

AppRegistry.registerComponent('PassportBattle', () => PassportBattle);