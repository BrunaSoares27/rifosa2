import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GradeNumeros({ 
  numerosTotais = [], 
  numerosOcupados = [], 
  numeroVencedor = null,
  numerosSelecionados = [], 
  onToggleNumero,
  interativo = true // Se for false, desativa cliques (ideal para gerenciamento)
}) {
  return (
    <View style={styles.gridContainer}>
      {numerosTotais.map((num) => {
        const isOcupado = numerosOcupados.includes(num);
        const isSelecionado = numerosSelecionados.includes(num);
        const isVencedor = num === numeroVencedor;

        return (
          <TouchableOpacity
            key={num}
            // Se for interativo (tela de compra), bloqueia ocupados. 
            // Se não for interativo (tela de gerenciamento), permite clicar em tudo!
            disabled={interativo ? isOcupado : false}
            activeOpacity={0.7}
            style={[
              styles.numBox,
              isSelecionado && styles.numBoxSelecionado,
              isOcupado && styles.numBoxOcupado,
              isVencedor && styles.numBoxVencedor,
            ]}
            onPress={() => {
              if (onToggleNumero) {
                onToggleNumero(num);
              }
            }}
          >
            <Text style={[
              styles.numText,
              isSelecionado && styles.numTextSelecionado,
              isOcupado && styles.numTextOcupado,
              isVencedor && styles.numTextVencedor,
            ]}>
              {num < 10 ? `0${num}` : num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 12,
    borderRadius: 12,
  },
  numBox: {
    width: 42,
    height: 42,
    backgroundColor: '#FFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  numBoxSelecionado: {
    backgroundColor: '#C44E04',
    borderColor: '#FFF',
  },
  numBoxOcupado: {
    backgroundColor: '#888',
    borderColor: '#666',
    opacity: 0.5,
  },
  numText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  numTextSelecionado: {
    color: '#FFF',
  },
  numTextOcupado: {
    color: '#444',
    textDecorationLine: 'line-through',
  },
  numBoxVencedor: {
    backgroundColor: '#2ECC71', // Verde de destaque / sucesso
    borderColor: '#FFF',
    borderWidth: 2,
  },
  numTextVencedor: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});