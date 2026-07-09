// src/screens/admin/AdminDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { VictoryPie, VictoryLine, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { colors, typography, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 12543,
    activeCards: 9876,
    todayTransactions: 342,
    revenueSummary: {
      today: 34250,
      week: 245800,
      month: 987600,
    },
  });

  const chartData = [
    { x: 'Mon', y: 45 },
    { x: 'Tue', y: 52 },
    { x: 'Wed', y: 48 },
    { x: 'Thu', y: 61 },
    { x: 'Fri', y: 78 },
    { x: 'Sat', y: 65 },
    { x: 'Sun', y: 42 },
  ];

  const routeUsage = [
    { x: 'Route A', y: 35, color: colors.primary },
    { x: 'Route B', y: 28, color: colors.secondary },
    { x: 'Route C', y: 22, color: colors.accent },
    { x: 'Route D', y: 15, color: colors.success },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: 'account-group',
      color: colors.primary,
      change: '+12%',
    },
    {
      title: 'Active Cards',
      value: stats.activeCards.toLocaleString(),
      icon: 'credit-card-multiple',
      color: colors.success,
      change: '+8%',
    },
    {
      title: "Today's Transactions",
      value: stats.todayTransactions.toLocaleString(),
      icon: 'cash-multiple',
      color: colors.accent,
      change: '+5%',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.revenueSummary.today),
      icon: 'currency-usd',
      color: colors.secondary,
      change: '+15%',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.fullName || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color={colors.gray700} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: card.color + '20' }]}>
              <Icon name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statTitle}>{card.title}</Text>
            <Text style={[styles.statChange, { color: card.color }]}>
              {card.change}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily Transactions</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={width - spacing.xl * 2}
          domainPadding={{ x: 10 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{ tickLabels: { fontSize: 10, fill: colors.gray600 } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `$${t}`}
            style={{ tickLabels: { fontSize: 10, fill: colors.gray600 } }}
          />
          <VictoryBar
            data={chartData}
            x="x"
            y="y"
            style={{
              data: { fill: colors.primary, width: 20 },
              labels: { fontSize: 10 },
            }}
            cornerRadius={4}
          />
        </VictoryChart>
      </View>

      <View style={styles.row}>
        <View style={[styles.chartCard, styles.halfCard]}>
          <Text style={styles.chartTitle}>Peak Travel Hours</Text>
          <View style={styles.pieContainer}>
            {routeUsage.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.x}</Text>
                <Text style={styles.legendValue}>{item.y}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.chartCard, styles.halfCard]}>
          <Text style={styles.chartTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="bus" size={20} color={colors.white} />
            <Text style={styles.actionText}>Manage Routes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
            <Icon name="account-group" size={20} color={colors.white} />
            <Text style={styles.actionText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.accentAction]}>
            <Icon name="file-chart" size={20} color={colors.white} />
            <Text style={styles.actionText}>Generate Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly Revenue Trend</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={220}
          width={width - spacing.xl * 2}
        >
          <VictoryAxis
            tickFormat={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            style={{ tickLabels: { fontSize: 10, fill: colors.gray600 } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `$${t}k`}
            style={{ tickLabels: { fontSize: 10, fill: colors.gray600 } }}
          />
          <VictoryLine
            data={[
              { x: 'Jan', y: 85 },
              { x: 'Feb', y: 92 },
              { x: 'Mar', y: 108 },
              { x: 'Apr', y: 95 },
              { x: 'May', y: 112 },
              { x: 'Jun', y: 125 },
            ]}
            style={{
              data: { stroke: colors.secondary, strokeWidth: 3 },
              labels: { fontSize: 10 },
            }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  greeting: {
    ...typography.body,
    color: colors.gray600,
  },
  adminName: {
    ...typography.h3,
    color: colors.primary,
  },
  notificationButton: {
    padding: spacing.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
  },
  statCard: {
    width: '50%',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray800,
    fontWeight: 'bold',
  },
  statTitle: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  statChange: {
    ...typography.caption,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  chartCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  pieContainer: {
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.gray700,
    flex: 1,
  },
  legendValue: {
    ...typography.bodySmall,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    backgroundColor: colors.secondary,
  },
  accentAction: {
    backgroundColor: colors.accent,
  },
  actionText: {
    ...typography.body,
    color: colors.white,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;