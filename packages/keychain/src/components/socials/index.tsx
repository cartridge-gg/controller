import {
  Empty,
  FollowerSocialList,
  FollowerSocialRow,
  FollowerTabs,
  LayoutContent,
  TabsContent,
} from "@cartridge/ui";

import { useAccount, useUsernames } from "@/hooks/account";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { BigNumberish, getChecksumAddress } from "starknet";
import { useLocation } from "react-router-dom";
import { useController } from "@/hooks/controller";
import { useNavigation } from "@/context/navigation";
import { createExecuteUrl } from "@/utils/connection/execute";

export function Socials() {
  const { controller } = useController();
  const account = useAccount();
  const address = account?.address || "";
  const {
    provider,
    followers: allFollowers,
    followeds: allFolloweds,
  } = useArcade();
  const [loading, setLoading] = useState<BigNumberish | null>(null);
  const { navigate } = useNavigation();
  const location = useLocation();

  // Extract the last segment of the path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const tabFromPath = ["followers", "following"].includes(lastSegment)
    ? lastSegment
    : "followers";

  const [tab, setTab] = useState(tabFromPath);

  // Redirect to base path if no controller is present
  useEffect(() => {
    if (!controller) {
      navigate("/", { replace: true });
    }
  }, [controller, navigate]);

  const { baseFollowers, baseFolloweds } = useMemo(() => {
    return address != ""
      ? {
          baseFollowers: allFollowers[getChecksumAddress(address)] ?? [],
          baseFolloweds: allFolloweds[getChecksumAddress(address)] ?? [],
        }
      : {
          baseFollowers: [],
          baseFolloweds: [],
        };
  }, [allFollowers, allFolloweds, address]);

  const addresses = useMemo(() => {
    return [...baseFollowers, ...baseFolloweds].map(
      (address) => `0x${BigInt(address).toString(16)}`,
    );
  }, [baseFollowers, baseFolloweds]);

  const { usernames } = useUsernames({ addresses });

  const { followers, followeds } = useMemo(() => {
    const followers = baseFollowers
      .map((follower) => {
        const username = usernames.find(
          (user: { username?: string; address?: string }) =>
            BigInt(user.address ?? "0x0") === BigInt(follower),
        );
        return {
          address: follower,
          username:
            username?.username ??
            `0x${BigInt(follower).toString(16)}`.slice(0, 9),
          following: baseFolloweds.includes(getChecksumAddress(follower)),
        };
      })
      .sort((a, b) => a.username.localeCompare(b.username));
    const followeds = baseFolloweds
      .map((followee) => {
        const username = usernames.find(
          (user: { username?: string; address?: string }) =>
            BigInt(user.address ?? "0x0") === BigInt(followee),
        );
        return {
          address: followee,
          username:
            username?.username ??
            `0x${BigInt(followee).toString(16)}`.slice(0, 9),
          following: false,
        };
      })
      .sort((a, b) => a.username.localeCompare(b.username));
    return { followers, followeds };
  }, [baseFollowers, baseFolloweds, usernames]);

  const handleSocialClick = useCallback(
    (
      target: BigNumberish,
      follow: boolean,
      setLoading: (address: BigNumberish | null) => void,
    ) => {
      if (!target || !provider) return;
      const process = async () => {
        setLoading(target);
        try {
          const calls = follow
            ? provider.social.follow({ target })
            : provider.social.unfollow({ target });

          // Create execute URL with returnTo parameter pointing back to socials
          const executeUrl = createExecuteUrl(
            Array.isArray(calls) ? calls : [calls],
          );

          // Navigate to execute screen with returnTo parameter to come back to socials
          const currentPath = `${location.pathname}${location.search}`;
          const executeUrlWithReturn = `${executeUrl}&returnTo=${encodeURIComponent(currentPath)}`;
          navigate(executeUrlWithReturn);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(null);
        }
      };
      process();
    },
    [provider, navigate, location],
  );

  useEffect(() => {
    // Update tab state when path changes
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const newTab = ["followers", "following"].includes(lastSegment)
      ? lastSegment
      : "followers";
    setTab(newTab);
  }, [location.pathname]);

  // Don't render anything if no controller (redirect will happen)
  if (!controller) {
    return null;
  }

  const handleTabChange = (value: string) => {
    // Navigate to the new path when tab changes
    const currentPath = location.pathname;
    const pathSegments = currentPath.split("/").filter(Boolean);

    // Replace the last segment with the new tab value
    if (
      ["followers", "following"].includes(pathSegments[pathSegments.length - 1])
    ) {
      pathSegments[pathSegments.length - 1] = value;
    } else {
      // If the last segment isn't a valid tab, append the tab value
      pathSegments.push(value);
    }

    navigate(`/${pathSegments.join("/")}`, { replace: true });
  };

  return (
    <>
      <LayoutContent className="py-6 gap-y-6 select-none overflow-hidden">
        <FollowerTabs
          followers={followers.length}
          following={followeds.length}
          value={tab}
          onValueChange={handleTabChange}
          className="h-full overflow-hidden"
        >
          <TabsContent
            className="p-0 mt-4 h-[calc(100%-56px)]"
            value="followers"
          >
            {followers.length === 0 ? (
              <EmptyState />
            ) : (
              <FollowerSocialList>
                {followers.map((item) => (
                  <FollowerSocialRow
                    key={item.address}
                    username={item.username}
                    following={item.following}
                    unfollowable={false}
                    loading={BigInt(loading || 0) === BigInt(item.address)}
                    disabled={
                      loading !== null &&
                      BigInt(loading || 0) !== BigInt(item.address)
                    }
                    onSocialClick={() =>
                      handleSocialClick(item.address, true, setLoading)
                    }
                  />
                ))}
              </FollowerSocialList>
            )}
          </TabsContent>
          <TabsContent
            className="p-0 mt-4 h-[calc(100%-56px)]"
            value="following"
          >
            {followeds.length === 0 ? (
              <EmptyState />
            ) : (
              <FollowerSocialList>
                {followeds.map((item) => (
                  <FollowerSocialRow
                    key={item.address}
                    username={item.username}
                    following={true}
                    unfollowable={true}
                    loading={BigInt(loading || 0) === BigInt(item.address)}
                    disabled={
                      loading !== null &&
                      BigInt(loading || 0) !== BigInt(item.address)
                    }
                    onSocialClick={() =>
                      handleSocialClick(item.address, false, setLoading)
                    }
                  />
                ))}
              </FollowerSocialList>
            )}
          </TabsContent>
        </FollowerTabs>
      </LayoutContent>
    </>
  );
}

const EmptyState = () => {
  return (
    <Empty title="It's lonely in here..." icon="discover" className="h-full" />
  );
};
