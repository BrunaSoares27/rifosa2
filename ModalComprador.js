import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function ModalComprador({
  visible,
  onClose,
  numeroClicado,
  comprador,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.btnCloseX} onPress={onClose}>
            <Text style={styles.txtX}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitulo}>
            Número {numeroClicado < 10 ? `0${numeroClicado}` : numeroClicado}
          </Text>

          <View style={{ marginVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 16, marginBottom: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>Comprador:</Text> {comprador?.nome}
            </Text>
            <Text style={{ color: '#FF9754', fontSize: 16, fontWeight: 'bold' }}>
              {comprador?.telefone}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.btnOkModal, { marginTop: 15 }]}
            onPress={onClose}
          >
            <Text style={styles.btnOkModalText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#706054',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
  },
  btnCloseX: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  txtX: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  btnOkModal: {
    backgroundColor: '#C44E04',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  btnOkModalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});