import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, List, Chip, FAB, IconButton } from 'react-native-paper';
import axios from 'axios';
import api from '../api/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const [stats, setStats] = useState({
        totalWorkers: 0,
        hospitalVisits: 0,
        homeVisits: 0,
        pendingConsultations: 0,
        completedConsultations: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllData = async () => {
        try {
            // Fetch stats from various endpoints
            const [workersRes, hospitalRes, homeRes, consultationsRes] = await Promise.all([
                api.get('/admin/workers'),
                api.get('/admin/hospital-visits'),
                api.get('/admin/home-visits'),
                api.get('/admin/consultations')
            ]);

            const pending = consultationsRes.data.consultations.filter(c => c.consultationStatus !== 'Completed');
            const completed = consultationsRes.data.consultations.filter(c => c.consultationStatus === 'Completed');

            setStats({
                totalWorkers: workersRes.data.workers.length,
                hospitalVisits: hospitalRes.data.visits.length,
                homeVisits: homeRes.data.visits.length,
                pendingConsultations: pending.length,
                completedConsultations: completed.length
            });
        } catch (error) {
            console.error('Failed to refresh dashboard stats', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4C8BF5" />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4C8BF5']} />
                }
            >
                {/* Stats Grid Overlay */}
                <View style={styles.statsGrid}>
                    <StatCard 
                        title="Total Workers" 
                        value={stats.totalWorkers} 
                        color="#4C8BF5" 
                        icon="account-group" 
                    />
                    <StatCard 
                        title="Hospital Visits" 
                        value={stats.hospitalVisits} 
                        color="#FF7F50" 
                        icon="hospital-building" 
                    />
                    <StatCard 
                        title="Home Visits" 
                        value={stats.homeVisits} 
                        color="#10B981" 
                        icon="home-heart" 
                    />
                    <StatCard 
                        title="Pending" 
                        value={stats.pendingConsultations} 
                        color="#EF4444" 
                        icon="stethoscope" 
                    />
                </View>

                <Title style={styles.sectionTitle}>Dashboard Actions</Title>
                
                <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                    <Card style={[styles.actionCard, { borderLeftColor: '#4C8BF5', borderLeftWidth: 5 }]}>
                        <Card.Content style={styles.actionContent}>
                            <View>
                                <Title style={styles.actionTitle}>New Patient Registration</Title>
                                <Paragraph style={styles.actionSubtitle}>Add a new profile to the system</Paragraph>
                            </View>
                            <IconButton icon="account-plus" color="#4C8BF5" size={28} />
                        </Card.Content>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Questionnaire')}>
                    <Card style={[styles.actionCard, { borderLeftColor: '#10B981', borderLeftWidth: 5 }]}>
                        <Card.Content style={styles.actionContent}>
                            <View>
                                <Title style={styles.actionTitle}>Daily Questionnaire</Title>
                                <Paragraph style={styles.actionSubtitle}>Screening and self-reporting</Paragraph>
                            </View>
                            <IconButton icon="clipboard-check" color="#10B981" size={28} />
                        </Card.Content>
                    </Card>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={styles.footerText}>Last data sync: {new Date().toLocaleTimeString()}</Text>
                </View>

            </ScrollView>

            <FAB
                style={styles.fab}
                color="#fff"
                icon="plus"
                onPress={() => navigation.navigate('Registration')}
            />
        </View>
    );
}

function StatCard({ title, value, color, icon }) {
    return (
        <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                    <IconButton icon={icon} color={color} size={24} />
                </View>
                <Title style={[styles.statValue, { color }]}>{value}</Title>
                <Text style={styles.statTitle}>{title}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#64748B',
        fontSize: 14,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: (width - 48) / 2,
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statTitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4,
    },
    actionCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
    },
    actionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#64748B',
    },
    footerInfo: {
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#4C8BF5',
    },
});
