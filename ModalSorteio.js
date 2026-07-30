import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function ModalSorteio({
  modalConfirmarVisivel,
  setModalConfirmarVisivel,
  modalResultadoVisivel,
  setModalResultadoVisivel,
  dadosVencedor,
  onConfirmarSorteio,
}) {
  return (
    <>
      {/* --- POPUP: CONFIRMAÇÃO DO SORTEIO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfirmarVisivel}
        onRequestClose={() => setModalConfirmarVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Realizar Sorteio?</Text>

            <Text style={{ color: '#FFF', fontSize: 15, textAlign: 'center', marginBottom: 20 }}>
              Deseja mesmo realizar o sorteio agora?
            </Text>

            {/* Botões Sim / Não Lado a Lado */}
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity 
                style={[styles.btnOkModal, { backgroundColor: '#888' }]}
                onPress={() => setModalConfirmarVisivel(false)}
              >
                <Text style={styles.btnOkModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnOkModal}
                onPress={onConfirmarSorteio}
              >
                <Text style={styles.btnOkModalText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalResultadoVisivel}
        onRequestClose={() => setModalResultadoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#FF9754', fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
              Eis o vencedor!!
            </Text>

            {/* Card com o número Sorteado */}
            <View style={{
              backgroundColor: '#2ECC71',
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 15,
              borderWidth: 3,
              borderColor: '#FFF'
            }}>
              <Text style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold' }}>
                {dadosVencedor?.numero < 10 ? `0${dadosVencedor?.numero}` : dadosVencedor?.numero}
              </Text>
            </View>

            <Text style={{ color: '#FFF', fontSize: 18, textAlign: 'center', marginBottom: 5 }}>
              Ganhador(a):
            </Text>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              {dadosVencedor?.nome}
            </Text>

            <TouchableOpacity 
              style={styles.btnOkModal}
              onPress={() => setModalResultadoVisivel(false)}
            >
              <Text style={styles.btnOkModalText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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