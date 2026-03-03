import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Patient, Bioimpedance, MedicationDose, Exam, Intervention } from '../types';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#334155',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#334155',
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 10,
  },
});

interface ReportProps {
  patient: Patient;
  bioimpedance: Bioimpedance[];
  doses: MedicationDose[];
  interventions: Intervention[];
}

const MedicalReport = ({ patient, bioimpedance, doses, interventions }: ReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MedTrack</Text>
          <Text style={styles.subtitle}>Relatório Clínico Integrado</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.subtitle}>Gerado em: {new Date().toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.subtitle}>Paciente: {patient.name}</Text>
        </View>
      </View>

      {/* Patient Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Paciente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Idade:</Text>
          <Text style={styles.value}>{patient.age} anos</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Meta de Peso:</Text>
          <Text style={styles.value}>{patient.weight_goal_kg} kg</Text>
        </View>
      </View>

      {/* Interventions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intervenções Ativas</Text>
        {interventions.filter(i => i.status === 'Ativo').map((int, i) => (
          <View key={i} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>• {int.name} ({int.type})</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginLeft: 10 }}>
              {int.dose} - {int.frequency}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Doses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas Doses (GLP-1)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Data</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Medicamento</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Dose</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Notas</Text></View>
          </View>
          {doses.slice(0, 5).map((dose, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{new Date(dose.applied_at).toLocaleDateString('pt-BR')}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{dose.medication_name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{dose.dose_mg} mg</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{dose.notes || '-'}</Text></View>
            </View>
          ))}
        </View>
      </View>

      {/* Bioimpedance History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolução Corporal</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Data</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Peso (kg)</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Gordura (kg)</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Massa Magra (kg)</Text></View>
          </View>
          {bioimpedance.slice(0, 8).map((bio, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{new Date(bio.measured_at).toLocaleDateString('pt-BR')}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bio.weight_kg}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bio.fat_mass_kg}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bio.lean_mass_kg}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>MedTrack - Sistema de Acompanhamento Médico - Documento Confidencial</Text>
    </Page>
  </Document>
);

export const PDFExportButton: React.FC<{
  patient: Patient,
  bioimpedance: Bioimpedance[],
  doses: MedicationDose[],
  interventions: Intervention[]
}> = (props) => (
  <PDFDownloadLink
    document={<MedicalReport {...props} />}
    fileName={`relatorio_${props.patient.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
  >
    {/* @ts-ignore */}
    {({ blob, url, loading, error }) => 
      loading ? 'Gerando PDF...' : 'Baixar Relatório PDF'
    }
  </PDFDownloadLink>
);
