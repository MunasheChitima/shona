package com.shonalearn.android.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Cross-platform Button component following Material Design 3 principles
 * Ensures consistency with web, iOS, and watchOS implementations
 */

enum class ShonaButtonVariant {
    Primary,        // Filled button - primary actions
    Secondary,      // Filled tonal button - secondary actions  
    Outline,        // Outlined button - medium emphasis
    Ghost,          // Text button - low emphasis
    Destructive,    // Error color for dangerous actions
    Success,        // Success color for positive actions
    Warning         // Warning color for caution actions
}

enum class ShonaButtonSize {
    XS,     // Extra small - 32dp height
    SM,     // Small - 36dp height
    MD,     // Medium - 40dp height (default)
    LG,     // Large - 48dp height
    XL      // Extra large - 56dp height
}

@Composable
fun ShonaButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ShonaButtonVariant = ShonaButtonVariant.Primary,
    size: ShonaButtonSize = ShonaButtonSize.MD,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingText: String = "Loading...",
    leftIcon: ImageVector? = null,
    rightIcon: ImageVector? = null,
    iconOnly: Boolean = false,
    fullWidth: Boolean = false,
    contentDescription: String? = null,
    content: @Composable () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    
    // Animation for loading state
    val alpha by animateFloatAsState(
        targetValue = if (loading) 0.7f else 1f,
        animationSpec = tween(150),
        label = "button_alpha"
    )
    
    val scale by animateFloatAsState(
        targetValue = if (loading) 0.98f else 1f,
        animationSpec = tween(150),
        label = "button_scale"
    )
    
    // Size configurations following Material Design 3
    val sizeConfig = getSizeConfig(size)
    
    // Apply full width modifier if needed
    val buttonModifier = modifier
        .let { if (fullWidth) it.fillMaxWidth() else it }
        .height(sizeConfig.height)
        .scale(scale)
        .alpha(alpha)
        .semantics {
            role = Role.Button
            contentDescription?.let { this.contentDescription = it }
        }
    
    // Button content with loading state
    val buttonContent: @Composable () -> Unit = {
        ButtonContent(
            loading = loading,
            loadingText = loadingText,
            leftIcon = leftIcon,
            rightIcon = rightIcon,
            iconOnly = iconOnly,
            size = size,
            content = content
        )
    }
    
    // Render appropriate button variant
    when (variant) {
        ShonaButtonVariant.Primary -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    disabledContainerColor = MaterialTheme.colorScheme.outline,
                    disabledContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Secondary -> {
            FilledTonalButton(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Outline -> {
            OutlinedButton(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.primary
                ),
                border = BorderStroke(
                    width = 1.dp,
                    color = if (enabled && !loading) {
                        MaterialTheme.colorScheme.outline
                    } else {
                        MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)
                    }
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Ghost -> {
            TextButton(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.primary
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Destructive -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error,
                    contentColor = MaterialTheme.colorScheme.onError
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Success -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF10B981), // Custom success color
                    contentColor = Color.White
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
        
        ShonaButtonVariant.Warning -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !loading,
                shape = RoundedCornerShape(sizeConfig.cornerRadius),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF59E0B), // Custom warning color
                    contentColor = Color.White
                ),
                contentPadding = sizeConfig.contentPadding,
                interactionSource = interactionSource,
                content = buttonContent
            )
        }
    }
}

@Composable
private fun ButtonContent(
    loading: Boolean,
    loadingText: String,
    leftIcon: ImageVector?,
    rightIcon: ImageVector?,
    iconOnly: Boolean,
    size: ShonaButtonSize,
    content: @Composable () -> Unit
) {
    val iconSize = getIconSize(size)
    
    Row(
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Loading indicator
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(iconSize),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            )
            
            if (!iconOnly) {
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = loadingText,
                    fontSize = getFontSize(size),
                    fontWeight = FontWeight.Medium
                )
            }
        } else {
            // Left icon
            leftIcon?.let { icon ->
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(iconSize)
                )
                
                if (!iconOnly) {
                    Spacer(modifier = Modifier.width(8.dp))
                }
            }
            
            // Button content (text)
            if (!iconOnly) {
                Box {
                    content()
                }
            }
            
            // Right icon  
            rightIcon?.let { icon ->
                if (!iconOnly) {
                    Spacer(modifier = Modifier.width(8.dp))
                }
                
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(iconSize)
                )
            }
        }
    }
}

// Button size configuration data class
private data class SizeConfig(
    val height: Dp,
    val contentPadding: PaddingValues,
    val cornerRadius: Dp
)

private fun getSizeConfig(size: ShonaButtonSize): SizeConfig = when (size) {
    ShonaButtonSize.XS -> SizeConfig(
        height = 32.dp,
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
        cornerRadius = 4.dp
    )
    ShonaButtonSize.SM -> SizeConfig(
        height = 36.dp,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
        cornerRadius = 4.dp
    )
    ShonaButtonSize.MD -> SizeConfig(
        height = 40.dp,
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
        cornerRadius = 4.dp
    )
    ShonaButtonSize.LG -> SizeConfig(
        height = 48.dp,
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp),
        cornerRadius = 6.dp
    )
    ShonaButtonSize.XL -> SizeConfig(
        height = 56.dp,
        contentPadding = PaddingValues(horizontal = 32.dp, vertical = 16.dp),
        cornerRadius = 8.dp
    )
}

private fun getIconSize(size: ShonaButtonSize): Dp = when (size) {
    ShonaButtonSize.XS -> 12.dp
    ShonaButtonSize.SM -> 14.dp
    ShonaButtonSize.MD -> 16.dp
    ShonaButtonSize.LG -> 18.dp
    ShonaButtonSize.XL -> 20.dp
}

private fun getFontSize(size: ShonaButtonSize) = when (size) {
    ShonaButtonSize.XS -> 12.sp
    ShonaButtonSize.SM -> 14.sp
    ShonaButtonSize.MD -> 16.sp
    ShonaButtonSize.LG -> 18.sp
    ShonaButtonSize.XL -> 20.sp
}