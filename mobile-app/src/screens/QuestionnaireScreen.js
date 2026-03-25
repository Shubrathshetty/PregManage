import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Title, Card, Text, Button, RadioButton, Divider, Subheading, TextInput } from 'react-native-paper';
import { submitQuestionnaire } from '../api/api';

export default function QuestionnaireScreen({ navigation }) {
    const [answers, setAnswers] = useState({
        q1_bleeding: false,
        q2_headache_vision: false,
        q3_swelling: false,
        q4_nausea_vomiting: false,
        q5_fetal_movement: false,
        q6_abdominal_pain: false,
        q7_fever_chills: false,
        q8_breathing_chest: false,
        q9_supplements: false,
        q10_checkup: false,
        doctorConsultation: false,
        consultationType: null,
        whatsappNumber: ''
    });

    const [loading, setLoading] = useState(false);

    const updateAnswer = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleFormSubmit = async () => {
        setLoading(true);
        try {
            const res = await submitQuestionnaire(answers);
            if (res.success) {
                Alert.alert('Form Submitted', 'The screening data has been saved.');
                navigation.goBack();
            } else {
                Alert.alert('Error', res.message || 'Submission failed.');
            }
        } catch (err) {
            Alert.alert('Server Error', 'Failed to submit data.');
        } finally {
            setLoading(false);
        }
    };

    const QuestionItem = ({ label, value, keyName }) => (
        <View style={styles.questionContainer}>
            <Subheading style={styles.questionText}>{label}</Subheading>
            <View style={styles.radioGroup}>
                <View style={styles.row}>
                    <RadioButton 
                        value={true} 
                        status={value === true ? 'checked' : 'unchecked'} 
                        onPress={() => updateAnswer(keyName, true)}
                        color="#4C8BF5"
                    />
                    <Text style={styles.radioLabel}>Yes</Text>
                </View>
                <View style={styles.row}>
                    <RadioButton 
                        value={false} 
                        status={value === false ? 'checked' : 'unchecked'} 
                        onPress={() => updateAnswer(keyName, false)}
                        color="#EF4444"
                    />
                    <Text style={styles.radioLabel}>No</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.mainTitle}>Self-Screening Questionnaire</Title>
            <Text style={styles.subtitle}>Daily check for health alerts</Text>

            <Card style={styles.card}>
                <Card.Content>
                    <QuestionItem 
                        label="Do you have any vaginal bleeding or fluid leakage?" 
                        value={answers.q1_bleeding} 
                        keyName="q1_bleeding" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Severe headache or blurred vision?" 
                        value={answers.q2_headache_vision} 
                        keyName="q2_headache_vision" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Swelling of face, hands or feet?" 
                        value={answers.q3_swelling} 
                        keyName="q3_swelling" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Severe nausea or vomiting?" 
                        value={answers.q4_nausea_vomiting} 
                        keyName="q4_nausea_vomiting" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Change in fetal movement frequency?" 
                        value={answers.q5_fetal_movement} 
                        keyName="q5_fetal_movement" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Severe abdominal pain?" 
                        value={answers.q6_abdominal_pain} 
                        keyName="q6_abdominal_pain" 
                    />
                    <Divider style={styles.divider} />
                    <QuestionItem 
                        label="Fever or chills?" 
                        value={answers.q7_fever_chills} 
                        keyName="q7_fever_chills" 
                    />
                </Card.Content>
            </Card>

            <Card style={[styles.card, { marginTop: 24, backgroundColor: '#EFF6FF' }]}>
                <Card.Content>
                    <Title style={{ fontSize: 16 }}>Need Doctor Consultation?</Title>
                    <View style={styles.radioGroup}>
                        <View style={styles.row}>
                            <RadioButton 
                                value={true} 
                                status={answers.doctorConsultation === true ? 'checked' : 'unchecked'} 
                                onPress={() => updateAnswer('doctorConsultation', true)}
                            />
                            <Text>Yes (Required)</Text>
                        </View>
                        <View style={styles.row}>
                            <RadioButton 
                                value={false} 
                                status={answers.doctorConsultation === false ? 'checked' : 'unchecked'} 
                                onPress={() => updateAnswer('doctorConsultation', false)}
                            />
                            <Text>No (Regular)</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleFormSubmit}
                loading={loading}
                style={styles.submitBtn}
                contentStyle={{ height: 50 }}
            >
                FINISH & SUBMIT
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
        backgroundColor: '#F8FAFC',
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 20,
    },
    card: {
        borderRadius: 16,
        elevation: 1,
    },
    questionContainer: {
        marginVertical: 12,
    },
    questionText: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
        marginBottom: 8,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radioLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        backgroundColor: '#E2E8F0',
    },
    submitBtn: {
        marginTop: 32,
        borderRadius: 12,
        backgroundColor: '#4C8BF5',
    }
});
