import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon, BeakerIcon, ScaleIcon } from 'react-native-heroicons/outline';
import { HeartIcon, FireIcon, LightBulbIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RecipeDetailScreen(props) {
    const recipe = props.route.params.recipe || {};
    console.log('Recipe received in RecipeDetaiScreen:', recipe)
    const [isFavourite, setIsFavourite] = useState(false);
    const navigation = useNavigation();

    const StatCard = ({ icon: Icon, value, label, color = "#2E7D32" }) => (
        <View style={{
            backgroundColor: '#E8F5E9',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            width: wp(22),
        }}>
            <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 8,
                marginBottom: 8,
            }}>
                <Icon size={24} color={color} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1B5E20' }}>{value}</Text>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
            }}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: '#2E7D32',
                        borderRadius: 12,
                        padding: 8,
                    }}
                >
                    <ChevronLeftIcon size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setIsFavourite(!isFavourite)}
                    style={{
                        backgroundColor: isFavourite ? '#ffcdd2' : '#E8F5E9',
                        borderRadius: 12,
                        padding: 8,
                    }}
                >
                    <HeartIcon size={24} color={isFavourite ? '#c62828' : '#2E7D32'} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
            >
                {/* Recipe Title */}
                <Animated.View 
                    entering={FadeInDown.duration(700)}
                    style={{ marginBottom: 24 }}
                >
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 }}>
                        {recipe.recipe_name || 'Recipe Name'}
                    </Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View 
                    entering={FadeInDown.delay(100).duration(700)}
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                    }}
                >
                    <StatCard 
                        icon={ClockIcon} 
                        value={`${recipe.cooking_time || 0}m`} 
                        label="Cook Time" 
                    />
                    <StatCard 
                        icon={ScaleIcon} 
                        value={`${recipe.protein || 0}g`} 
                        label="Protein" 
                    />
                    <StatCard 
                        icon={FireIcon} 
                        value={recipe.calories || 0} 
                        label="Calories" 
                    />
                    <StatCard 
                        icon={BeakerIcon} 
                        value={recipe.difficulty || 'Easy'} 
                        label="Level" 
                    />
                </Animated.View>

                {/* Ingredients Section */}
                <Animated.View 
                    entering={FadeInDown.delay(200).duration(700)}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16 }}>
                        Ingredients
                    </Text>
                    {(recipe.ingredients || []).map((ingredient, index) => (
                        <View 
                            key={index}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#2E7D32',
                                marginRight: 12,
                            }} />
                            <Text style={{ fontSize: 16, color: '#666' }}>
                                {ingredient.amount} {ingredient.name}
                            </Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Instructions Section */}
                <Animated.View 
                    entering={FadeInDown.delay(300).duration(700)}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16 }}>
                        Instructions
                    </Text>
                    {(recipe.instructions || []).map((step, index) => (
                        <View 
                            key={index}
                            style={{
                                flexDirection: 'row',
                                marginBottom: 16,
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginRight: 12 }}>
                                {index + 1}.
                            </Text>
                            <Text style={{ flex: 1, fontSize: 16, color: '#666' }}>
                                {step}
                            </Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Cooking Tips Section */}
                <Animated.View 
                    entering={FadeInDown.delay(400).duration(700)}
                    style={{
                        backgroundColor: '#E8F5E9',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <LightBulbIcon size={24} color="#2E7D32" />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginLeft: 8 }}>
                            Pro Tips
                        </Text>
                    </View>
                    {(recipe.tips || []).map((tip, index) => (
                        <Text 
                            key={index}
                            style={{
                                fontSize: 16,
                                color: '#666',
                                marginBottom: 8,
                            }}
                        >
                            • {tip}
                        </Text>
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
