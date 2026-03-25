import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Subheading, Card, Text, Divider, List, RadioButton } from 'react-native-paper';
import { registerPatient } from '../api/api';

export default function RegistrationScreen({ navigation }) {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        aadhaar: '',
        age: '',
        dob: '',
        husbandName: '',
        bloodGroup: '',
        lmp: '',
        edd: '',
        gravida: '',
        para: '',
        address: {
            street: '',
            taluk: '',
            district: '',
            state: '',
            pincode: ''
        }
    });

    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateAddress = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleRegister = async () => {
        if (!formData.fullName || !formData.phone || !formData.aadhaar) {
            Alert.alert('Incomplete Form', 'Please fill all required fields marked with *');
            return;
        }

        setLoading(true);
        try {
            const res = await registerPatient(formData);
            if (res.success) {
                Alert.alert('Success', 'Patient registered successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', res.message || 'Registration failed.');
            }
        } catch (err) {
            Alert.alert('Server Error', 'Could not connect to backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Title style={styles.title}>Basic Biodata</Title>

                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Full Name *"
                            value={formData.fullName}
                            onChangeText={v => updateField('fullName', v)}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Phone Number *"
                            value={formData.phone}
                            onChangeText={v => updateField('phone', v)}
                            mode="outlined"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                        <View style={styles.row}>
                            <TextInput
                                label="Aadhaar Number *"
                                value={formData.aadhaar}
                                onChangeText={v => updateField('aadhaar', v)}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="Age *"
                                value={formData.age}
                                onChangeText={v => updateField('age', v)}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={[styles.input, { width: 80 }]}
                            />
                        </View>
                        <TextInput
                            label="Date of Birth (YYYY-MM-DD)"
                            value={formData.dob}
                            onChangeText={v => updateField('dob', v)}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Husband's Name"
                            value={formData.husbandName}
                            onChangeText={v => updateField('husbandName', v)}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Blood Group"
                            value={formData.bloodGroup}
                            onChangeText={v => updateField('bloodGroup', v)}
                            mode="outlined"
                            style={styles.input}
                        />
                    </Card.Content>
                </Card>

                <Title style={[styles.title, { marginTop: 24 }]}>Obstetric History</Title>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.row}>
                            <TextInput
                                label="LMP (YYYY-MM-DD)"
                                value={formData.lmp}
                                onChangeText={v => updateField('lmp', v)}
                                mode="outlined"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="EDD (YYYY-MM-DD)"
                                value={formData.edd}
                                onChangeText={v => updateField('edd', v)}
                                mode="outlined"
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                label="Gravida (G)"
                                value={formData.gravida}
                                onChangeText={v => updateField('gravida', v)}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="Para (P)"
                                value={formData.para}
                                onChangeText={v => updateField('para', v)}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>
                    </Card.Content>
                </Card>

                <Title style={[styles.title, { marginTop: 24 }]}>Address Details</Title>
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Street / Door No."
                            value={formData.address.street}
                            onChangeText={v => updateAddress('street', v)}
                            mode="outlined"
                            style={styles.input}
                        />
                        <View style={styles.row}>
                            <TextInput
                                label="Taluk"
                                value={formData.address.taluk}
                                onChangeText={v => updateAddress('taluk', v)}
                                mode="outlined"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="District"
                                value={formData.address.district}
                                onChangeText={v => updateAddress('district', v)}
                                mode="outlined"
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                label="State"
                                value={formData.address.state}
                                onChangeText={v => updateAddress('state', v)}
                                mode="outlined"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label="Pincode"
                                value={formData.address.pincode}
                                onChangeText={v => updateAddress('pincode', v)}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={[styles.input, { width: 120 }]}
                            />
                        </View>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitBtn}
                    contentStyle={{ height: 50 }}
                >
                    SUBMIT REGISTRATION
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 16,
        elevation: 2,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
    },
    submitBtn: {
        marginTop: 32,
        borderRadius: 12,
        backgroundColor: '#4C8BF5',
    }
});
