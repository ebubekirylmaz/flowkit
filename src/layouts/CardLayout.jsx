import React from "react";

import { Box, Card, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const STYLES = {
  width: "100%",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  lineHeight: 1.3,
  opacity: 0.85,
};

export function MediaAvatarCard({
  sx,
  leftContent,
  rightContent,
  title,
  description,
  footer,
  background,
  overlayColor,
  backgroundClassName = "animated-background-image",
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 0,
        minWidth: 350,
        maxWidth: 450,
        height: 120,
        borderRadius: 1.5,
        textAlign: "left",
        position: "relative",
        display: "flex",
        flexDirection: "row",
        fontSize: 12,
        color: "rgba(255,255,255,0.82)",
        lineHeight: 1.3,
        boxShadow: (theme) => theme.shadows[3],
        "&:hover": {
          boxShadow: (theme) => theme.shadows[6],
        },
        overflow: "hidden",
        [`&:hover .${backgroundClassName}`]: {
          width: "100%",
        },
        ...sx,
      }}
    >
      {background && (
        <Box
          className={backgroundClassName}
          sx={{
            width: 100,
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundColor:
                overlayColor || alpha(theme.palette.grey[900], 0.48),
            },
          }}
        />
      )}

      <Stack
        direction="column"
        spacing={1}
        sx={{
          width: 100,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "8px 0 0 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {leftContent}
      </Stack>

      <Stack
        direction="column"
        sx={{
          flex: 1,
          padding: 2,
          zIndex: 1,
          position: "relative",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        {rightContent ? (
          rightContent
        ) : (
          <>
            <Stack spacing={1} sx={{ width: "100%", minWidth: 0 }}>
              <Box>{title}</Box>

              {description && (
                <Typography variant="inherit" sx={STYLES}>
                  {description}
                </Typography>
              )}
            </Stack>

            {footer && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                {footer}
              </Box>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}

export function SideStripeCard({
  sx,
  stripeContent,
  mainContent,
  title,
  description,
  footer,
  minWidth = 200,
  maxWidth = 290,
  height = 100,
  stripeWidth = 65,
}) {
  const theme = useTheme();

  return (
    <Box sx={{ cursor: "pointer" }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth,
          maxWidth,
          height,
          borderRadius: 1.5,
          boxShadow: 3,
          position: "relative",
          overflow: "hidden",
          fontSize: 12,
          lineHeight: 1.3,
          color: "rgba(255,255,255,0.82)",
          "&:hover": {
            boxShadow: 6,
            "& .animated-background-selector": {
              width: "100%",
              borderRadius: 1.5,
            },
            "& .responsibility-title, & .responsibility-description": {
              color: theme.palette.getContrastText(theme.palette.primary.light),
            },
          },
          ...sx,
        }}
      >
        <Box
          className="animated-background-selector"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: stripeWidth,
            backgroundColor: theme.palette.primary.light,
            borderRadius: "8px 0 0 8px",
            transition: theme.transitions.create(["width", "border-radius"], {
              duration: theme.transitions.duration.short,
            }),
            zIndex: 0,
          }}
        />
        <Stack
          direction="column"
          spacing={1}
          sx={{
            position: "relative",
            zIndex: 1,
            width: stripeWidth,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 1,
          }}
        >
          {stripeContent}
        </Stack>

        <Stack
          direction="column"
          sx={{
            padding: 2,
            position: "relative",
            zIndex: 1,
            flex: 1,
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {mainContent ? (
            mainContent
          ) : (
            <>
              <Box sx={{ minWidth: 0 }}>
                {typeof title === "string" ? (
                  <Typography
                    variant="inherit"
                    sx={{
                      color: "text.primary",
                      wordBreak: "break-word",
                      hyphens: "auto",
                      fontWeight: 600,
                    }}
                  >
                    {title}
                  </Typography>
                ) : (
                  title
                )}

                {description && (
                  <Typography
                    variant="inherit"
                    sx={{
                      ...STYLES,
                      mt: 0.5,
                      color: "text.primary",
                      opacity: 0.8,
                    }}
                  >
                    {description}
                  </Typography>
                )}
              </Box>

              {footer && (
                <Box sx={{ alignSelf: "flex-end", mt: 0.5 }}>{footer}</Box>
              )}
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

export function HeaderCard({
  sx,
  header,
  children,
  height = 140,
  padding = 2,
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: padding,
        minWidth: 200,
        maxWidth: 420,
        height,
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        fontSize: 12,
        lineHeight: 1.3,
        color: "rgba(255,255,255,0.82)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
          "&:before": { height: "100%" },
        },
        "&:before": {
          content: '""',
          width: "100%",
          height: "40%",
          position: "absolute",
          top: 0,
          left: 0,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.secondary.light,
            0.2
          )}, ${alpha(theme.palette.primary.main, 0.3)})`,
          borderRadius: "8px 8px 0 0",
          transition: "height 0.3s ease-in-out",
        },
        ...sx,
      }}
    >
      <Stack
        spacing={2}
        sx={{ height: "100%", position: "relative", zIndex: 1 }}
      >
        {header}
        {children}
      </Stack>
    </Card>
  );
}

export function AvatarRoleCard({
  sx,
  leftContent,
  topRightContent,
  bottomContent,
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2.5,
        width: 230,
        height: 120,
        borderRadius: 2,
        position: "relative",
        backgroundColor: theme.palette.background.paper,
        fontSize: 12,
        lineHeight: 1.3,
        color: "rgba(255,255,255,0.82)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
          "&:before": { height: "100%" },
        },
        "&:before": {
          content: '""',
          width: "100%",
          height: "40%",
          position: "absolute",
          top: 0,
          left: 0,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.secondary.light,
            0.2
          )}, ${alpha(theme.palette.primary.main, 0.3)})`,
          borderRadius: "8px 8px 0 0",
          transition: "height 0.3s ease-in-out",
        },
        ...sx,
      }}
    >
      <Stack
        spacing={1}
        sx={{ height: "100%", position: "relative", zIndex: 1 }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start"
          }}>
          {leftContent}
          {topRightContent}
        </Stack>

        {bottomContent && <Stack spacing={0.5}>{bottomContent}</Stack>}
      </Stack>
    </Card>
  );
}
